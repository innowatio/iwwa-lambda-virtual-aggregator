import {map, reduce} from "bluebird";
import {filter, isNil, partial} from "ramda";

import getValueFromSensorsInFormula from "./get-value-from-sensors-in-formula";

function getDefaultVirtualAggregate (reading, formula) {
    return {
        sensorId: formula.resultId,
        date: reading.date,
        source: reading.source,
        measurementType: reading.measurementType,
        formula: formula.formulaString,
        unitOfMeasurement: reading.unitOfMeasurement,
        measurementValues: {
            [reading.sensorId]: parseFloat(reading.measurementValue)
        }
    };
}
async function getVirtualAggregate (reading, formula) {
    const defaultVirtualAggregate = getDefaultVirtualAggregate(reading, formula);
    const valueFromAggregateInFormula = await getValueFromSensorsInFormula(
        reading.sensorId,
        formula.variables,
        defaultVirtualAggregate
    );
    if (!valueFromAggregateInFormula) {
        return null;
    }
    return {
        ...defaultVirtualAggregate,
        measurementValues: {
            ...defaultVirtualAggregate.measurementValues,
            ...valueFromAggregateInFormula
        }
    };
}
function filterNullInArray (virtualAggregate) {
    return !isNil(virtualAggregate);
}
export default async function createVirtualAggregate (readings, formulas) {
    return reduce(readings, async (acc, reading) => {
        const virtualAggregates = await map(formulas, partial(getVirtualAggregate, [reading]));
        return acc.concat(
            /*
            *   Filter the null in the array. It's possible to have null if a
            *   collection is not found.
            */
            filter(filterNullInArray, virtualAggregates)
        );
    }, []);
}
