import {isNil, values} from "ramda";
import {parse, round} from "mathjs";


const DECIMALS = 3;

function skipSum (measurements) {
    return measurements.findIndex(isNil) >= 0;
}

function randomString (len) {
    const charSet = "abcdefghijklmnopqrstuvwxyz";
    var randomString = "";
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz+1);
    }
    return randomString;
}

// replace sensors names to avoid issues with ids containing '-'
function replaceSensors (aggregate) {
    const variables = Object.keys(aggregate.measurementValues).sort((a, b) => (b+ "").length - (a + "").length);
    var replacedAggregate = {
        ...aggregate,
        measurementValues: {}
    };
    variables.forEach((variable) => {
        const newVariable = randomString(8);
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
    const result = round(formula.eval(newAggregate.measurementValues), DECIMALS);

    return {
        ...aggregate,
        result: result
    };
}

export default function resolveFormulas (virtualAggregates) {
    return (
        virtualAggregates
            .map(applyFormula)
            .filter(aggregate => !isNil(aggregate))
    );
}
