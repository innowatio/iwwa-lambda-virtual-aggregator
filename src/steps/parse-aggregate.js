function parseMeasurementValues (measurementValues) {
    return measurementValues !== null ? (
        measurementValues
            .split(",")
            .map(value => parseFloat(value))
            .map(value => isNaN(value) ? null : value)
    ) : [];
}

export default function parseAggregate (aggregate) {
    return {
        ...aggregate,
        measurementValues: parseMeasurementValues(aggregate.measurementValues)
    };
}
