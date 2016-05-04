import assert from "assert";
import {contains, is, isNil} from "ramda";
import get from "lodash.get";

import {ALLOWED_ENERGY_TYPES} from "../config";

function getReadingSource (reading) {
    const source = (
        reading.source ?
        reading.source :
        get(reading, "measurements.0.source")
    );
    assert(is(String, source), "Reading has no source");
    return source;
}
export default function spreadReadingByMeasurementType (reading) {
    const source = getReadingSource(reading);
    return reading.measurements.map(measurement => {
        return contains(measurement.type, ALLOWED_ENERGY_TYPES) ? {
            sensorId: reading.sensorId,
            date: reading.date,
            source,
            measurementType: measurement.type,
            measurementValue: measurement.value,
            unitOfMeasurement: measurement.unitOfMeasurement
        } : null;
    }).filter(reading => !isNil(reading));
}
