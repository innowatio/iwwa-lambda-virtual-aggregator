import BPromise from "bluebird";

import getValueFromSensorsInFormula from "./get-values-from-sensors-in-formula";

export default function createVirtualMeasurementValue (rawReading, formulas) {
    const sensorId = rawReading.sensorId;
    return rawReading.measurements.map(measurement => {
        const source = rawReading.source ? rawReading.source : rawReading.measurements[0].source;
        const measurementType = measurement.type;
        formulas.map(formula => {
            const virtualAggregate = {
                sensorId: formula.resultId,
                date: rawReading.date,
                source,
                measurementType,
                formula: formula.formulaString,
                measurementValues: [{
                    sensorId,
                    measurementValue: measurement.value
                }]
            };
            return BPromise.all(getValueFromSensorsInFormula(rawReading, formula, virtualAggregate, sensorId))
                .then(valueFromAggregateInFormula => ({
                    ...virtualAggregate,
                    measurementValues: virtualAggregate.measurementValues.concat(valueFromAggregateInFormula)
                }));
        });
    });
}
