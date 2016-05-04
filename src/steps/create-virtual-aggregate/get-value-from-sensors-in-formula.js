import {filter, partial} from "ramda";
import {reduce} from "bluebird";

import getAggregate from "./get-aggregate";
import parseAggregate from "../parse-aggregate";
import getMeasurementValueFromAggregate from "./get-measurement-value-from-aggregate";

function filterFormula (readingSensorId, variable) {
    return variable !== readingSensorId;
}
// Get the sensors in the `variables` in the formula, filtered by the sensor of the given event.
function getSensorInFormula (readingSensorId, variables) {
    return filter(
        partial(filterFormula, [readingSensorId]),
        variables
    );
}
export default async function getValueFromSensorsInFormula (readingSensorId, variables, virtualAggregate, sampleDeltaMS) {
    const sensors = getSensorInFormula(readingSensorId, variables);
    const measurementType = virtualAggregate.measurementType;
    const source = virtualAggregate.source;
    const date = virtualAggregate.date;
    return reduce(sensors, async (acc, sensorId) => {
        const aggregate = await getAggregate(sensorId, measurementType, source, date);
        if (!aggregate) {
            return null;
        }
        const parsedAggregate = parseAggregate(aggregate);
        // Get the delta between the point of measurements, that it will be the range of time where I get the values to use in formula.
        const measurementValueFromAggregate = getMeasurementValueFromAggregate(parsedAggregate, date, sampleDeltaMS);
        return {
            ...acc,
            [sensorId]: measurementValueFromAggregate
        };
    }, {});
}
