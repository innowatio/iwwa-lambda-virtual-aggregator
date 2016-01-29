import {filter, partial} from "ramda";

import getAggregate from "./get-aggregate";
import parseAggregate from "./parse-aggregate";
import getMeasurementValueFromAggregate from "./get-measurement-value-from-aggregate";


function filterFormula (sensorId, variable) {
    return variable !== sensorId;
}
export default async function getValuesFromSensorsInFormula (rawReading, formula, virtualAggregate, sensorId) {
    const sensors = filter(partial(filterFormula, [sensorId]), formula.variables);
    const measurementType = virtualAggregate.measurementType;
    const source = virtualAggregate.source;
    const date = virtualAggregate.date;
    return sensors.map(async sensor => {
        const aggregate = await getAggregate({sensor, measurementType, source, date});
        const parsedAggregate = parseAggregate(aggregate);
        const measurementValuesFromAggregate = getMeasurementValueFromAggregate(parsedAggregate, date);
        console.log(measurementValuesFromAggregate);
        return {
            sensorId: sensor,
            measurementValue: measurementValuesFromAggregate
        };
    });
}
