import axios from "axios";
import {groupBy, isEmpty, isNil, values} from "ramda";
import {map} from "bluebird";

import log from "../services/logger";
import * as kinesis from "../services/kinesis";
import {KINESIS_STREAM_NAME, READINGS_API_ENDPOINT} from "config";

function createBody (aggregates) {
    return {
        sensorId: aggregates[0].sensorId,
        date: aggregates[0].date,
        source: aggregates[0].source,
        measurements: aggregates.map(agg => {
            if ((!isNaN(agg.result)) && (!isNil(agg.result))) {
                return {
                    type: agg.measurementType,
                    value: agg.result,
                    unitOfMeasurement: agg.unitOfMeasurement
                };
            }
        }).filter(checkNotValid)
    };
}

function checkNotValid (value) {
    return !isNil(value);
}

export async function postSensorEvent (aggregates) {
    const body = createBody(aggregates);
    log.info(body, `body of the post at: ${READINGS_API_ENDPOINT}`);
    if (body.measurements) {
        try {
            await axios.post(READINGS_API_ENDPOINT, body);
        } catch (e) {
            log.info(e, "error while performing post");
            throw new Error(e);
        }
    }
}

function _putRecords (virtualMeasurements) {
    const body = createBody(virtualMeasurements);
    if (body.measurements && !isEmpty(body.measurements)) {
        const records = [{
            Data: JSON.stringify(body),
            PartitionKey: body.sensorId
        }];
        log.debug({records}, "Putting Kinesis records");
        return kinesis.putRecords({
            Records: records,
            StreamName: KINESIS_STREAM_NAME
        });
    }
}

export function putRecords (virtualMeasurements) {
    return map(
        values(groupBy((measurement) => measurement.sensorId, virtualMeasurements)),
        _putRecords,
        {concurrency: 1}
    );
}
