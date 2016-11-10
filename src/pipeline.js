import {isEmpty} from "ramda";

import log from "./services/logger";
import skipProcessing from "./steps/skip-processing";
import findAllFormulaByVariable from "./steps/find-all-formulas-by-variable";
import spreadReadingByMeasurementType from "./steps/spread-reading-by-measurement-type";
import createVirtualAggregate from "./steps/create-virtual-aggregate/";
import resolveFormulas from "./steps/resolve-formulas";
import {putRecords} from "./steps/put-in-kinesis";

export default async function pipeline (event) {
    log.info(event, "event");
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

    // Filter and spread reading
    const readings = spreadReadingByMeasurementType(rawReading);

    // Find related formulas
    const formulas = await findAllFormulaByVariable(rawReading.sensorId);
    log.debug(formulas, "formulas");
    if (isEmpty(formulas)) {
        log.info("LAMBDA SKIPPED EMPTY FORMULAS");
        return null;
    }

    // Find related sensors readings value
    const virtualAggregatesToCalculate = await createVirtualAggregate(readings, formulas);
    log.debug(virtualAggregatesToCalculate, "virual aggregates to calculate");
    if (isEmpty(virtualAggregatesToCalculate)) {
        log.info("LAMBDA SKIPPED EMPTY VIRTUAL AGGREGATE");
        return null;
    }

    // Calculate all
    const virtualAggregatesToSubmit = resolveFormulas(virtualAggregatesToCalculate);
    log.debug(virtualAggregatesToSubmit, "virtual aggregates to submit");
    if (isEmpty(virtualAggregatesToSubmit)) {
        log.info("LAMBDA SKIPPED EMPTY VIRTUAL AGGREGATES TO SUBMIT");
        return null;
    }

    await putRecords(virtualAggregatesToSubmit);

    return null;
}
