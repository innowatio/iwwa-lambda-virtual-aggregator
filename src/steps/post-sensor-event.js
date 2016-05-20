import axios from "axios";
import {isNil, splitEvery} from "ramda";
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

function _putRecords (events) {
    const records = events.map(event => ({
        Data: JSON.stringify(event),
        PartitionKey: event.data.element.sensorId
    }));
    log.debug({records}, "Putting Kinesis records");
    return kinesis.putRecords({
        Records: records,
        StreamName: KINESIS_STREAM_NAME
    });
}

export async function putRecords (virtualMeasurements) {
    const batches = splitEvery(250, virtualMeasurements);
    return map(batches, _putRecords, {concurrency: 1});
}
