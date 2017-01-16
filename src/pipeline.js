import {log} from "./services/logger";

import {skipReading} from "./steps/skip-reading";
import {findVirtualSensors} from "./steps/find-virtual-sensors";
import {decoupleReading} from "./steps/decouple-reading";
import {getAggregatesWithReading} from "./steps/get-aggregates-with-reading";
import {getDecoratedFormulas} from "./steps/get-decorated-formulas";
import {findSensorsAggregates} from "./steps/find-sensors-aggregates";
import {filterSensorsAggregates} from "./steps/filter-sensors-aggregates";
import {aggregateSensorsAggregates} from "./steps/aggregate-aggregates";
import {applyFormula} from "./steps/apply-formula";
import {dispatchReading} from "./steps/dispatch-reading";

export default async function pipeline (event) {

    try {
        const reading = event.data.element;
        /*
        *   Workaround: some events have been incorrectly generated and thus don't
        *   have an `element` property. When processing said events, just return and
        *   move on without failing, as failures can block the kinesis stream.
        */
        if (!reading) {
            return;
        }
        log.info({event});

        const skip = skipReading(reading);
        log.debug({skip});
        if (skip) {
            return;
        }

        const virtualSensors = await findVirtualSensors(reading.sensorId, reading.date);
        log.debug({virtualSensors});
        if (virtualSensors.length === 0) {
            return;
        }

        const decoupledReadings = decoupleReading(reading);
        log.debug({decoupledReadings});

        const readingAggregates = await getAggregatesWithReading(reading.date, decoupledReadings);
        log.debug({readingAggregates});

        const formulas = getDecoratedFormulas(virtualSensors);
        log.debug({formulas});

        for (var index = 0; index < formulas.length; index++) {
            const formula = formulas[index];

            const sensorsAggregates = await findSensorsAggregates(reading, formula);
            log.debug({sensorsAggregates});

            const aggregates = [
                ...sensorsAggregates,
                ...readingAggregates
            ];
            log.debug({aggregates});

            const filteredAggregates = filterSensorsAggregates(reading, formula, aggregates);
            log.debug({filteredAggregates});

            const aggregatedAggregates = aggregateSensorsAggregates(formula, filteredAggregates);
            log.debug({aggregatedAggregates});

            const result = applyFormula(formula, aggregatedAggregates);
            log.debug({
                result,
                formula
            });

            if (!isNaN(parseFloat(result))) {
                await dispatchReading(reading, formula, result);
            }
        }

    } catch (error) {
        log.error(error);
        throw error;
    }
}
