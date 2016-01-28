import {propEq, contains} from "ramda";

function checkSource (reading) {
    const ALLOWED_SOURCES = ["reading"];
    return contains((reading.source || reading.measurements[0].source), ALLOWED_SOURCES);
}

function checkContainsEnergyMeasures (reading) {
    return (
        reading.measurements.find(propEq("type", "activeEnergy")) ||
        reading.measurements.find(propEq("type", "reactiveEnergy")) ||
        reading.measurements.find(propEq("type", "maxPower")));
}

export function skipProcessing (reading) {
    return (
        // Ignore if not a reading
        !checkSource(reading) ||
        // Ignore readings without an `activeEnergy`, `reactiveEnergy`, `maxPower` measurement
        !checkContainsEnergyMeasures(reading)
    );
}
