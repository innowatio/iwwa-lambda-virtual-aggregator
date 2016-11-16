import moment from "moment";
import inRange from "lodash.inrange";
import first from "lodash.first";
import last from "lodash.last";
import max from "lodash.max";
import min from "lodash.min";
import {
    mean,
    sum
} from "ramda";

import log from "../../services/logger";

export default function measurementByAggregator(parsedAggregate, date, deltaTime, aggregationType = "oldest") {

    const startTime = moment(date).valueOf();
    const endTime = moment(date).valueOf() + deltaTime;

    const measurements = parsedAggregate.measurementTimes.map((measurementTime, index) => {
        return {
            time: measurementTime,
            value: parsedAggregate.measurementValues[index]
        };
    }).filter(x => inRange(x.time, startTime, endTime));

    if (measurements.length === 0) {
        return null;
    }

    log.info({
        parsedAggregate,
        measurements,
        aggregationType
    });

    switch (aggregationType) {
        case "max":
            return max(measurements.map(x => x.value));
        case "mean":
            return mean(measurements.map(x => x.value));
        case "newest":
            return last(measurements.map(x => x.value));
        case "oldest":
            return first(measurements.map(x => x.value));
        case "min":
            return min(measurements.map(x => x.value));
        case "sum":
            return sum(measurements.map(x => x.value));
        default:
            return null;
    }
}
