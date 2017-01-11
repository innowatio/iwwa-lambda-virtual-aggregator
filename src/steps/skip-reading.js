import {contains} from "ramda";

import {ALLOWED_SOURCES} from "../config";

export function skipReading (reading) {
    const {source} = reading;
    return !contains(source, ALLOWED_SOURCES);
}
