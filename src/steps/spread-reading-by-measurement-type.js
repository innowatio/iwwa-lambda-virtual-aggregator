import assert from "assert";
import {contains, is, isNil, path} from "ramda";

import * as config from "../config";

function getReadingSource (reading) {
    const source = (
        reading.source ?
        reading.source :
        path(["measurements", "0", "source"], reading)
    );
    assert(is(String, source), "Reading has no source");
    return source;
}
export default function spreadReadingByMeasurementType (reading) {
    const source = getReadingSource(reading);
    return reading.measurements.map(measurement => {
        return contains(measurement.type, config.ALLOWED_ENERGY_TYPES) ? {
            sensorId: reading.sensorId,
            date: reading.date,
            source,
            measurementType: measurement.type,
            measurementValue: measurement.value,
            unitOfMeasurement: measurement.unitOfMeasurement
        } : null;
    }).filter(reading => !isNil(reading));
}
