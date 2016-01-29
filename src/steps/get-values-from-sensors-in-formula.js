import {filter, partial} from "ramda";
import {reduce} from "bluebird";

import getAggregate from "./get-aggregate";
import parseAggregate from "./parse-aggregate";
import getMeasurementValueFromAggregate from "./get-measurement-value-from-aggregate";


function filterFormula (sensorId, variable) {
    return variable !== sensorId;
}
export default async function getValuesFromSensorsInFormula (sensorId, variables, virtualAggregate) {
    const sensors = filter(partial(filterFormula, [sensorId]), variables);
    const measurementType = virtualAggregate.measurementType;
    const source = virtualAggregate.source;
    const date = virtualAggregate.date;
    return reduce(sensors, async (acc, sensor) => {
        const aggregate = await getAggregate({sensor, measurementType, source, date});
        if (!aggregate) {
            return null;
        }
        const parsedAggregate = parseAggregate(aggregate);
        const measurementValuesFromAggregate = getMeasurementValueFromAggregate(parsedAggregate, date);
        return {
            ...acc,
            [sensor]: measurementValuesFromAggregate
        };
    }, {});
}
