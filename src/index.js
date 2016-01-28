import router from "kinesis-router";

import skipProcessing from "./steps/skip-processing";


async function pipeline (event) {
    log.info({event});
    const rawReading = event.data.element;
    /*
    *   Workaround: some events have been incorrectly generated and thus don't
    *   have an `element` property. When processing said events, just return and
    *   move on without failing, as failures can block the kinesis stream.
    */
    if (!rawReading) {
        return null;
    }

    // check if use it or not
    if (skipProcessing(rawReading)) {
        return null;
    }

    // filter measurements
    

    // find sensor name
    const sensor = rawReading.sensorId;

    // find related formulas

    // calculate all

    return null;
}

export const handler = router()
    .on("element inserted in collection readings", pipeline);
