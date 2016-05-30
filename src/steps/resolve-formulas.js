import {isNil, values} from "ramda";
import {parse} from "mathjs";

function skipSum (measurements) {
    return measurements.findIndex(isNil) >= 0;
}

// replace sensors names to avoid issues with ids containing '-'
function replaceSensors (aggregate) {
    const variables = Object.keys(aggregate.measurementValues).sort((a, b) => (a + "").length < (b+ "").length);
    var replacedAggregate = {
        ...aggregate,
        measurementValues: {}
    };
    variables.forEach((variable) => {
        const newVariable = variable.replace(/[^0-9a-z]/gi, "");
        replacedAggregate.measurementValues[newVariable] = aggregate.measurementValues[variable];
        replacedAggregate.formula = replacedAggregate.formula.replace(variable, newVariable);
    });
    return replacedAggregate;
}

function applyFormula (aggregate) {
    const measurements = values(aggregate.measurementValues);
    if (skipSum(measurements)) {
        return null;
    }
    const newAggregate = replaceSensors(aggregate);
    const parsedFormula = parse(newAggregate.formula);
    const formula = parsedFormula.compile();

    return {
        ...aggregate,
        result: formula.eval(newAggregate.measurementValues)
    };
}

export default function resolveFormulas (virtualAggregates) {
    return (
        virtualAggregates
            .map(applyFormula)
            .filter(aggregate => !isNil(aggregate))
    );
}
