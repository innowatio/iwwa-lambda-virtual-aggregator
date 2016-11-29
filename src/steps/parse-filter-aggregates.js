import inRange from "lodash.inrange";
import moment from "moment";
import first from "lodash.first";
import last from "lodash.last";
import max from "lodash.max";
import min from "lodash.min";
import {
    mean,
    sum
} from "ramda";

import log from "../services/logger";

function parseMeasurement(measurement, parseFunc) {
    return measurement !== null ? (
        measurement
            .split(",")
            .map(value => parseFunc(value))
    ) : [];
}

export function parseFilterAggregates(aggregates, readingDate, sampleDelta, aggregationType) {

    return aggregates.map(aggregate => {

        const readingTime = moment.utc(readingDate).valueOf();

        const startTime = moment.utc(readingDate).valueOf() - moment.utc(readingDate).valueOf() % sampleDelta;
        const endTime = startTime + sampleDelta;

        log.debug({
            sampleDelta,
            readingTime,
            readingDate,
            startTime,
            "startDate": moment.utc(startTime).format(),
            endTime,
            "endDate": moment.utc(endTime).format()
        });

        const values = parseMeasurement(aggregate.measurementValues, parseFloat);
        const times = parseMeasurement(aggregate.measurementTimes, parseInt);
        const measurements = values.map((value, index) => {
            return {
                value,
                time: times[index]
            };
        }).filter(x => inRange(x.time, startTime, endTime));

        let measurementTime = "";
        let measurementValue = "";

        if (first(measurements)) {
            measurementTime = first(measurements).time;
            switch (aggregationType) {
                case "max":
                    measurementValue = max(measurements.map(x => x.value));
                    break;
                case "mean":
                    measurementValue = mean(measurements.map(x => x.value));
                    break;
                case "newest":
                    measurementValue = last(measurements.map(x => x.value));
                    break;
                case "min":
                    measurementValue = min(measurements.map(x => x.value));
                    break;
                case "sum":
                    measurementValue = sum(measurements.map(x => x.value));
                    break;
                default:
                    measurementValue = first(measurements.map(x => x.value));
                    break;
            }
        }

        return {
            ...aggregate,
            measurementValues: measurementValue.toString(),
            measurementTimes: measurementTime.toString()
        };

    }).filter(x => {
        return !isNaN(parseInt(x.measurementValues));
    });
}
