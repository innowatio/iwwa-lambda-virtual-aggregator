import "babel/polyfill";
import router from "kinesis-router";
import {map} from "bluebird";
import {isEmpty} from "ramda";

import skipProcessing from "./steps/skip-processing";
import findAllFormulaByVariable from "./steps/find-all-formulas-by-variable";
import spreadReadingByMeasurementType from "./steps/spread-reading-by-measurement-type";
import createVirtualAggregate from "./steps/create-virtual-aggregate/";
import getOrCreateVirtualAggregate from "./steps/get-or-create-virtual-aggregate";
import parseAggregate from "./steps/parse-aggregate";
import updateAggregate from "./steps/update-aggregate";
import stringifyAggregate from "./steps/stringify-aggregate";
import upsertAggregate from "./steps/upsert-aggregate";
import resolveFormulas from "./steps/resolve-formulas";
import postSensorEvent from "./steps/post-sensor-event";

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
    const virtualAggregatesToCalculate = await createVirtualAggregate(readings, formulas);
    if (isEmpty(virtualAggregatesToCalculate)) {
        return null;
    }
    // calculate all and upsert
    console.log(virtualAggregatesToCalculate);
    const virtualAggregatesToSubmit = resolveFormulas(virtualAggregatesToCalculate);
    const sensors = virtualAggregatesToSubmit.map(agg => agg.sensorId);
    // push group by sensorId
    await sensors.map(sensor => {
        return virtualAggregatesToSubmit.filter(agg => agg.sensorId === sensor);
    }, postSensorEvent);

    return null;
}

export const handler = router()
    .on("element inserted in collection readings", pipeline);
