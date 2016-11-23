import {reduce} from "bluebird";
import moment from "moment";

import log from "../../services/logger";
import parseAggregate from "../parse-aggregate";
import getAggregate from "./get-aggregate";
import getMeasurementValueFromAggregate from "./get-measurement-value-from-aggregate";

export default async function getValueFromSensorsInFormula (reading, variables, virtualAggregate, sampleDeltaInMS) {
    const {
        aggregationType,
        date,
        measurementType,
        source
    } = virtualAggregate;
    log.info({
        virtualAggregate,
        reading,
        variables
    });
    const values = await reduce(variables, async (acc, sensorId) => {
        const aggregate = await getAggregate(sensorId, measurementType, source, date);
        log.info({aggregate});
        if (!aggregate) {
            return null;
        }

        var parsedAggregate = parseAggregate(aggregate);
        if (parsedAggregate.sensorId === reading.sensorId) {
            parsedAggregate = {
                ...parsedAggregate,
                measurementValues: [...parsedAggregate.measurementValues, parseFloat(reading.measurementValue)],
                measurementTimes: [...parsedAggregate.measurementTimes, moment.utc(reading.date).valueOf()]
            };
        }

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
