import {propEq, contains} from "ramda";

function checkSource (reading) {
    const ALLOWED_SOURCES = ["reading"];
    return contains((reading.source || reading.measurements[0].source), ALLOWED_SOURCES);
}

function hasActiveEnergy (reading) {
    return !!reading.measurements.find(propEq("type", "activeEnergy"));
}

function hasFormulaDependencies (reading) {
    return reading.formulaDependencies && reading.formulaDependencies.size > 0;
}

export function skipProcessing (reading) {
    return (
        // Skip if there are no formula dependencies
        !hasFormulaDependencies(reading) ||
        // Ignore if not a reading
        !checkSource(reading) ||
        // Ignore readings without an `activeEnergy` measurements
        !hasActiveEnergy(reading)
    );
}
