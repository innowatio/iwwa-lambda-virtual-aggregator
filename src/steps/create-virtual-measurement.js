import {map} from "bluebird";

import getValueFromSensorsInFormula from "./get-values-from-sensors-in-formula";

function getVirtualAggregate (reading, formula) {
    return {
        sensorId: formula.resultId,
        date: reading.date,
        source: reading.source,
        measurementType: reading.measurementType,
        formula: formula.formulaString,
        unitOfMeasurement: reading.unitOfMeasurement,
        measurementValues: {
            [reading.sensorId]: reading.measurementValue
        }
    };
}
export default async function createVirtualMeasurementValue (readings, formulas) {
    return map(readings, async reading => {
        return map(formulas, async formula => {
            const virtualAggregate = getVirtualAggregate(reading, formula);
            const valueFromAggregateInFormula = await getValueFromSensorsInFormula(
                reading.sensorId,
                formula.variables,
                virtualAggregate
            );
            return {
                ...virtualAggregate,
                measurementValues: {
                    ...virtualAggregate.measurementValues,
                    ...valueFromAggregateInFormula
                }
            };
        });
    });
}
