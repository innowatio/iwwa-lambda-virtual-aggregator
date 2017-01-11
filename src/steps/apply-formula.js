import {parse} from "mathjs";

export function applyFormula(formula, aggregates) {

    const variables = formula.variables.map(variable => {
        const {
            symbol,
            sensorId,
            measurementType
        } = variable;

        const aggregate = aggregates.find(x => x.sensorId === sensorId && x.measurementType === measurementType);

        if (aggregate) {
            return {
                symbol,
                measurementValues: aggregate.measurementValues,
                measurementTimes: aggregate.measurementTimes
            };
        }
    });

    if (variables.filter(x => !x).length === 0) {

        const compiledFormula = parse(formula.formula).compile();

        const data = variables.reduce((state, variable) => {
            state[variable.symbol] = parseFloat(variable.measurementValues);
            return state;
        }, {});

        const result = compiledFormula.eval(data);

        return result;
    }

}
