import router from "kinesis-router";
import {map} from "bluebird";
import {isEmpty} from "ramda";

import skipProcessing from "./steps/skip-processing";
import findAllFormulaByVariable from "./steps/find-all-formulas-by-variable";
import spreadReadingByMeasurementType from "./steps/spread-reading-by-measurement-type";
import createVirtualMeasurement from "./steps/create-virtual-measurement";
import getOrCreateVirtualAggregate from "./steps/get-or-create-virtual-aggregate";
import parseAggregate from "./steps/parse-aggregate";
import updateAggregate from "./steps/update-aggregate";
import stringifyAggregate from "./steps/stringify-aggregate";
import upsertAggregate from "./steps/update-aggregate";

async function calculateVirtualAggregate (virtualMeasurement) {
    const virtualAggregate = await getOrCreateVirtualAggregate(virtualMeasurement);
    const parsedAggregate = parseAggregate(virtualAggregate);
    const updatedParsedAggregate = updateAggregate(parsedAggregate, virtualMeasurement);
    const updatedAggregate = stringifyAggregate(updatedParsedAggregate);
    return upsertAggregate(updatedAggregate);
}
async function pipeline (event) {
    // log.info({event});
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
    // Filter and spread reading
    const readings = spreadReadingByMeasurementType(rawReading);
    // find related formulas
    const formulas = await findAllFormulaByVariable(rawReading.sensorId);
    if (isEmpty(formulas)) {
        return null;
    }
    // find related sensors readings value
    const virtualMeasurements = await createVirtualMeasurement(readings, formulas);
    // calculate all and upsert
    await map(virtualMeasurements, calculateVirtualAggregate);

    return null;
}

export const handler = router()
    .on("element inserted in collection readings", pipeline);
