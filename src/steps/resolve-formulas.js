import {isNil, values} from "ramda";
import {parse} from "mathjs";

function skipSum (measurements) {
    return measurements.findIndex(isNil) >= 0;
}

function applyFormula (aggregate) {
    const measurements = values(aggregate.measurementValues);
    if (skipSum(measurements)) {
        return null;
    }
    const parsedFormula = parse(aggregate.formula);
    const formula = parsedFormula.compile();

    return {
        ...aggregate,
        result: formula.eval(aggregate.measurementValues)
    };
}

export default function resolveFormulas (virtualAggregates) {
    return (
        virtualAggregates
            .map(applyFormula)
            .filter(aggregate => !isNil(aggregate))
    );
}
