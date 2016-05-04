function parseMeasurement (measurement, parseFunc) {
    return measurement !== null ? (
        measurement
            .split(",")
            .map(value => parseFunc(value))
    ) : [];
}

export default function parseAggregate (aggregate) {
    return {
        ...aggregate,
        measurementValues: parseMeasurement(aggregate.measurementValues, parseFloat),
        measurementTimes: parseMeasurement(aggregate.measurementTimes, parseInt)
    };
}
