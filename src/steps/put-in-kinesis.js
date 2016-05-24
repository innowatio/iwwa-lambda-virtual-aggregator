import {groupBy, isNil, partial} from "ramda";
import {map} from "bluebird";

import log from "../services/logger";
import dispatchEvent from "services/dispatcher";
import {READINGS_API_ENDPOINT, SENSOR_INSERT} from "config";

function createEvent (aggregates) {
    return {
        element: {
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
        }
    };
}

function checkNotValid (value) {
    return !isNil(value);
}

export function putRecords (virtualMeasurements) {
    return map(
        Object.values(
            groupBy(
                (measurement) => measurement.sensorId,
                virtualMeasurements.filter(measure => !isNil(measure.result))
            )
        ).map((measurements) => {
            const newEvent = createEvent(measurements);
            log.info(measurements, `body of the post at: ${READINGS_API_ENDPOINT}`);
            return newEvent;
        }),
        partial(dispatchEvent, [SENSOR_INSERT]),
        {concurrency: 1}
    );
}
