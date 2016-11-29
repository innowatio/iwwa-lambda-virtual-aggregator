import {isEmpty} from "ramda";
import {map} from "bluebird";
import get from "lodash.get";
import moment from "moment";

import {evaluateFormula} from "iwwa-formula-resolver";

import log from "./services/logger";
import {addSensorsDataToFormulas} from "./steps/add-sensors-data-to-formulas";
import {dispatchReadingEvent} from "./steps/dispatch-reading-event";
import {findFormulasByVariable} from "./steps/find-formulas-by-variable";
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

        await map(virtualSensors, async (virtualSensor) => {

            const decoratedFormulas = await addSensorsDataToFormulas(virtualSensor.formulas, rawReading);

            const filteredFormulas = decoratedFormulas.filter(x => {
                return x.variables.length === x.sensorsData.length;
            });

            let date = "";

            const measurements = filteredFormulas.map(decoratedFormula => {

                const result = evaluateFormula({
                    formula: decoratedFormula.formula
                }, decoratedFormula.sensorsData, decoratedFormula.sampleDeltaInMS);

                log.debug({
                    decoratedFormula,
                    result
                });

                date = moment.utc(parseInt(result.measurementTimes)).toISOString();

                return {
                    type: decoratedFormula.measurementType,
                    value: Math.round(parseFloat(result.measurementValues) * 1000) / 1000,
                    unitOfMeasurement: rawReading.measurements.find(x => x.type == decoratedFormula.measurementType).unitOfMeasurement
                };
            });

            await dispatchReadingEvent(virtualSensor._id, date, source, measurements);
        });

    } catch (error) {
        log.error(error);
        throw error;
    }
}
