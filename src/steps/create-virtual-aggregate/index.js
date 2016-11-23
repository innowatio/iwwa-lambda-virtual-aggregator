import {map, reduce} from "bluebird";
import {filter, isNil, partial} from "ramda";
import moment from "moment";

import getValueFromSensorsInFormula from "./get-value-from-sensors-in-formula";
import {DEFAULT_SAMPLE_DELTA_IN_MS} from "../../config.js";
import log from "../../services/logger";

function convertReadingDate (dateString, measurementDelta) {
    const dateInMs = moment.utc(dateString).valueOf();
    return dateInMs - (dateInMs % measurementDelta);
}

function getCorrectFormula (formula, measurementType, measurementDate) {
    const measurmentTime = new Date(measurementDate).getTime();
    return (formula.formulas || []).find(
        (stageFormula) => {
            const startTime = new Date(stageFormula.start).getTime();
            const endTime = new Date(stageFormula.end).getTime();
            return stageFormula.measurementType.includes(measurementType) && startTime <= measurmentTime && measurmentTime < endTime;
        });
}

function getDefaultVirtualAggregate (reading, formula, sampleDeltaInMS) {
    const date = convertReadingDate(reading.date, sampleDeltaInMS);
    return {
        sensorId: formula._id,
        date: moment(date).toISOString(),
        source: reading.source,
        measurementType: reading.measurementType,
        formula: formula.formula,
        aggregationType: formula.aggregationType,
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
        reading,
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
    return await reduce(readings, async (acc, reading) => {
        const correctFormulas = formulas.map((formula) => {
            const formulaToUse = getCorrectFormula(formula, reading.measurementType, reading.date);
            if (!formulaToUse) {
                return null;
            }
            return {
                _id: formula._id,
                ...formulaToUse
            };
        }).filter(filterNullInArray);
        const virtualAggregates = await map(correctFormulas, partial(getVirtualAggregate, [reading]));
        log.debug({virtualAggregates});
        return acc.concat(
            /*
            *   Filter the null or undefined in the array. It's possible to have null if a
            *   collection is not found.
            */
            filter(filterNullInArray, virtualAggregates)
        );
    }, []);
}
