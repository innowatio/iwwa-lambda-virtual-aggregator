import {isEmpty, uniq} from "ramda";
import {map} from "bluebird";
import get from "lodash.get";
import inRange from "lodash.inrange";
import moment from "moment";

import {evaluateFormula} from "iwwa-formula-resolver";

import log from "./services/logger";
import {addSensorsDataToFormulas} from "./steps/add-sensors-data-to-formulas";
import {dispatchReadingEvent} from "./steps/dispatch-reading-event";
import {findFormulasByVariable} from "./steps/find-formulas-by-variable";
import {removeOldVirtualReadings} from "./steps/remove-old-virtual-readings";
import {skipProcessing} from "./steps/skip-processing";

export default async function pipeline (event) {

    try {
        const rawReading = event.data.element;

        /*
        *   Workaround: some events have been incorrectly generated and thus don't
        *   have an `element` property. When processing said events, just return and
        *   move on without failing, as failures can block the kinesis stream.
        */
        if (!rawReading) {
            return null;
        }

        // Check if use it or not
        if (skipProcessing(rawReading)) {
            return null;
        }

        log.info({event});

        // Find related virtual sensor with interested formulas
        const virtualSensors = await findFormulasByVariable(rawReading.sensorId);
        log.debug({virtualSensors});
        if (isEmpty(virtualSensors)) {
            log.debug("LAMBDA SKIPPED EMPTY FORMULAS");
            return null;
        }

        const source = get(rawReading, "measurements.0.source", rawReading.source);
        const readingTime = moment.utc(rawReading.date);

        await map(virtualSensors, async (virtualSensor) => {

            const decoratedFormulas = await addSensorsDataToFormulas(virtualSensor.formulas, rawReading);

            const filteredFormulas = decoratedFormulas.filter(x => {
                return x.variables.length === x.sensorsData.length;
            }).filter(x => {
                const formulaStart = moment.utc(x.start).valueOf();
                const formulaEnd = moment.utc(x.end).valueOf();
                return inRange(readingTime.valueOf(), formulaStart, formulaEnd);
            });

            const formulaWithResult = await map(filteredFormulas, async (decoratedFormula) => {

                const result = evaluateFormula({
                    formula: decoratedFormula.formula
                }, decoratedFormula.sensorsData, decoratedFormula.sampleDeltaInMS);

                log.debug({
                    decoratedFormula,
                    result
                });

                await removeOldVirtualReadings(virtualSensor._id, source, decoratedFormula.measurementType, rawReading.date, decoratedFormula.sampleDeltaInMS);

                return {
                    ...decoratedFormula,
                    result
                };
            });

            const samples = uniq(formulaWithResult.map(x => x.sampleDeltaInMS || 300000));

            await samples.map(async (sample) => {
                const formulasBySample = formulaWithResult.filter(x => x.sampleDeltaInMS === sample);

                const date = moment.utc(readingTime.valueOf() - readingTime.valueOf() % sample).toISOString();

                const measurements = formulasBySample.map(formula => {
                    return {
                        type: formula.measurementType,
                        value: Math.round(parseFloat(formula.result.measurementValues) * 1000) / 1000,
                        unitOfMeasurement: rawReading.measurements.find(x => x.type === formula.measurementType).unitOfMeasurement
                    };
                });

                await dispatchReadingEvent(virtualSensor._id, date, source, measurements);
            });

        });

    } catch (error) {
        log.error(error);
        throw error;
    }
}
