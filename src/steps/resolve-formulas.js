import {isNil, values} from "ramda";
import sum from "lodash.sum";

function skipSum (measurements) {
    return measurements.findIndex(isNil) >= 0;
}

function applyFormula (aggregate) {
    const measurements = values(aggregate.measurementValues);
    if (skipSum(measurements)) {
        return null;
    }
    return {
        ...aggregate,
        result: sum(measurements)
    };
}

export default function resolveFormulas (virtualAggregates) {
    return (
        virtualAggregates
            .map(applyFormula)
            .filter(aggregate => !isNil(aggregate))
    );
}
