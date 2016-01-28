import {contains, merge} from "ramda";

import * as config from "../services/config";

export function filterAllowedMeasurements (reading) {
    return merge(reading, {
        measurements: reading.measurements.filter((measure) => {
            return contains(measure.type, config.ALLOWED_ENERGY_TYPES);
        })
    });
}
