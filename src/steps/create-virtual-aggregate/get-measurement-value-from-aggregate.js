import moment from "moment";

import {MEASUREMENTS_DELTA_IN_MS} from "../../config";

function convertReadingDate (dateString) {
    const dateInMs = moment.utc(dateString, moment.ISO_8601, true).valueOf();
    return dateInMs - (dateInMs % MEASUREMENTS_DELTA_IN_MS);
}

function getOffset (readingDate) {
    const date = convertReadingDate(readingDate);
    const startOfDay = moment.utc(date).startOf("day").valueOf();
    return (date - startOfDay) / MEASUREMENTS_DELTA_IN_MS;
}

export default function getMeasurementValueFromAggregate (parsedAggregate, date) {
    const offset = getOffset(date);
    return parsedAggregate.measurementValues[offset];
}
