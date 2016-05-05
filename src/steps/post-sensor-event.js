import axios from "axios";
import {isNil} from "ramda";
import {READINGS_API_ENDPOINT} from "../config";

import log from "../services/logger";

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

export default async function postSensorEvent (aggregates) {
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
