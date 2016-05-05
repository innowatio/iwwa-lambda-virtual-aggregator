import {map, reduce} from "bluebird";
import {filter, isNil, partial} from "ramda";
import moment from "moment";

import getValueFromSensorsInFormula from "./get-value-from-sensors-in-formula";
import {DEFAULT_SAMPLE_DELTA_IN_MS} from "../../config.js";

function convertReadingDate (dateString, measurementDelta) {
    const dateInMs = moment.utc(dateString, moment.ISO_8601, true).valueOf();
    return dateInMs - (dateInMs % measurementDelta);
}

function getDefaultVirtualAggregate (reading, formula, sampleDeltaInMS) {
    const date = convertReadingDate(reading.date, sampleDeltaInMS);
    return {
        sensorId: formula.resultId,
        date: moment(date).toISOString(),
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
    const sampleDeltaInMS = formula.sampleDeltaInMS || DEFAULT_SAMPLE_DELTA_IN_MS;
    const defaultVirtualAggregate = getDefaultVirtualAggregate(reading, formula, sampleDeltaInMS);
    const valueFromAggregateInFormula = await getValueFromSensorsInFormula(
        reading.sensorId,
        formula.variables,
        defaultVirtualAggregate,
        sampleDeltaInMS
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
            *   Filter the null or undefined in the array. It's possible to have null if a
            *   collection is not found.
            */
            filter(filterNullInArray, virtualAggregates)
        );
    }, []);
}
