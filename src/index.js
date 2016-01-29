import router from "kinesis-router";

import skipProcessing from "./steps/skip-processing";
import findAllFormulaByVariable from "./steps/find-formulas";
import filterAllowedMeasurements from "./steps/filter-allowed-measurements";


async function pipeline (event) {
    const rawReading = event.data.element;
    /*
    *   Workaround: some events have been incorrectly generated and thus don't
    *   have an `element` property. When processing said events, just return and
    *   move on without failing, as failures can block the kinesis stream.
    */
    if (!rawReading) {
        return null;
    }

    // check if use the measures or not
    if (skipProcessing(rawReading)) {
        return null;
    }

    const sensor = rawReading.sensorId;

    // find related formulas
    const formulas = findAllFormulaByVariable(sensor);

    // filter measurements
    const filteredReading = filterAllowedMeasurements(rawReading);






    // calculate all

    return null;
}

export const handler = router()
    .on("element inserted in collection readings", pipeline);
