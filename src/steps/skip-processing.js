import {contains} from "ramda";

import {ALLOWED_SOURCES} from "../config";

function checkSource (reading) {
    return contains(
        (reading.source || reading.measurements[0].source),
        ALLOWED_SOURCES
    );
}

export default function skipProcessing (reading) {
    // Ignore if not a reading
    return !checkSource(reading);
}
