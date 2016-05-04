import moment from "moment";
import inRange from "lodash.inrange";

function getMeasurementIndex (parsedAggregate, date, sampleDeltaMS) {
    const readingDate = moment(date).valueOf();
    return parsedAggregate.measurementTimes.findIndex(measurementTime => {
        return inRange(
            measurementTime,
            readingDate,
            moment(readingDate).add(sampleDeltaMS, "ms").valueOf()
        );
    });
}

export default function getMeasurementValueFromAggregate (parsedAggregate, date, sampleDeltaMS) {
    const measurementIndex = getMeasurementIndex(parsedAggregate, date, sampleDeltaMS);
    if (measurementIndex >= 0) {
        return parsedAggregate.measurementValues[measurementIndex];
    }
    return null;
}
