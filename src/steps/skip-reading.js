import {contains} from "ramda";

import {ALLOWED_SOURCES} from "../config";

export function skipReading (reading) {
    return !contains(reading.source || reading.measurements[0].source, ALLOWED_SOURCES);
}
