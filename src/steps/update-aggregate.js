import moment from "moment";
import {add, reduce, values} from "ramda";

import {MEASUREMENTS_DELTA_IN_MS} from "../services/config";

function convertReadingDate (dateString) {
    const dateInMs = moment.utc(dateString, moment.ISO_8601, true).valueOf();
    return dateInMs - (dateInMs % MEASUREMENTS_DELTA_IN_MS);
}

function getOffset (reading) {
    const date = convertReadingDate(reading.date);
    const startOfDay = moment.utc(date).startOf("day").valueOf();
    return (date - startOfDay) / MEASUREMENTS_DELTA_IN_MS;
}

function calculateMeasurementValues (virtualMeasurement) {
    const measurementValues = values(virtualMeasurement.measurementValues);
    return reduce((acc, measurementValue) => {
        return add(acc, parseFloat(measurementValue));
    }, 0, measurementValues);
}

function updateMeasurementValues (measurementValues, offset, measurementValue) {
    /*
    *   Updating the measurementValues array without modifying it:
    *       - clone the array
    *       - update the clone at the correct index
    *       - return the clone
    */
    const measurementValuesClone = measurementValues.slice(0);
    measurementValuesClone[offset] = parseFloat(measurementValue);
    return measurementValuesClone;
}

export default function updateAggregate (aggregate, virtualMeasurement) {
    const newValues = calculateMeasurementValues(virtualMeasurement);
    if (isNaN(newValues)) {
        return aggregate;
    }
    const offset = getOffset(virtualMeasurement);
    return {
        ...aggregate,
        measurementValues: updateMeasurementValues(
            aggregate.measurementValues, offset, newValues
        )
    };
}
