import moment from "moment";
import inRange from "lodash.inrange";

function getMeasurementIndex (parsedAggregate, date, sampleDeltaInMS) {
    const readingDate = moment(date).valueOf();
    return parsedAggregate.measurementTimes.findIndex(measurementTime => {
        return inRange(
            measurementTime,
            readingDate,
            moment(readingDate).add(sampleDeltaInMS, "ms").valueOf()
        );
    });
}

export default function getMeasurementValueFromAggregate (parsedAggregate, date, sampleDeltaInMS) {
    const measurementIndex = getMeasurementIndex(parsedAggregate, date, sampleDeltaInMS);
    if (measurementIndex >= 0) {
        return parsedAggregate.measurementValues[measurementIndex];
    }
    return null;
}
