import {filter, partial} from "ramda";
import {reduce} from "bluebird";

import getAggregate from "./get-aggregate";
import parseAggregate from "../parse-aggregate";
import getMeasurementValueFromAggregate from "./get-measurement-value-from-aggregate";

function filterFormula (sensorId, variable) {
    return variable !== sensorId;
}
// Get the sensors in the `variables` in the formula, filtered by the sensor of the given event.
function getSensorInFormula (sensorId, variables) {
    return filter(
        partial(filterFormula, [sensorId]),
        variables
    );
}
export default async function getValueFromSensorsInFormula (sensorId, variables, virtualAggregate) {
    const sensors = getSensorInFormula(sensorId, variables);
    const measurementType = virtualAggregate.measurementType;
    const source = virtualAggregate.source;
    const date = virtualAggregate.date;
    return reduce(sensors, async (acc, sensorId) => {
        const aggregate = await getAggregate(sensorId, measurementType, source, date);
        if (!aggregate) {
            return null;
        }
        const parsedAggregate = parseAggregate(aggregate);
        const measurementValuesFromAggregate = getMeasurementValueFromAggregate(parsedAggregate, date);
        return {
            ...acc,
            [sensorId]: measurementValuesFromAggregate
        };
    }, {});
}
