import {filter, partial} from "ramda";
import {reduce} from "bluebird";

import log from "../../services/logger";
import parseAggregate from "../parse-aggregate";
import getAggregate from "./get-aggregate";
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

export default async function getValueFromSensorsInFormula (readingSensorId, variables, virtualAggregate, sampleDeltaInMS) {
    const sensors = getSensorInFormula(readingSensorId, variables);
    const {
        aggregationType,
        date,
        measurementType,
        source
    } = virtualAggregate;
    log.info({
        virtualAggregate,
        sensors,
        readingSensorId,
        variables
    });
    const values = await reduce(sensors, async (acc, sensorId) => {
        const aggregate = await getAggregate(sensorId, measurementType, source, date);
        log.info({aggregate});
        if (!aggregate) {
            return null;
        }
        const parsedAggregate = parseAggregate(aggregate);
        // Get the delta between the point of measurements, that it will be the range of time where I get the values to use in formula.
        const measurementValueFromAggregate = getMeasurementValueFromAggregate(parsedAggregate, date, sampleDeltaInMS, aggregationType);
        log.info({measurementValueFromAggregate});
        return {
            ...acc,
            [sensorId]: measurementValueFromAggregate
        };
    }, {});
    log.info({values});
    return values;
}
