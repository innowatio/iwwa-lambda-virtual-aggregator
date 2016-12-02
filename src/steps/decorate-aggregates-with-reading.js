import moment from "moment";

export function decorateAggregatesWithReading(aggregates, reading, day, source, formula) {

    const measurement = reading.measurements.find(x => x.type == formula.measurementType);
    if (measurement) {
        let aggregate = aggregates.find(x => x.sensorId === reading.sensorId && x.measurementType === measurement.type);
        if (aggregate) {

            let measurementValues = aggregate.measurementValues.split(",");
            let measurementTimes = aggregate.measurementTimes.split(",");
            const readingTime = moment.utc(reading.date).valueOf();
            const existingReadings = measurementTimes.findIndex(x => parseInt(x) == readingTime);
            if (0 <= existingReadings) {
                measurementValues[existingReadings] = measurement.value;
            } else {
                measurementValues = [...measurementValues, measurement.value];
                measurementTimes = [...measurementTimes, readingTime];
            }

            aggregates = [
                ...aggregates.filter(x => !(x.sensorId === reading.sensorId && x.measurementType === measurement.type)),
                {
                    ...aggregate,
                    measurementValues: measurementValues.join(","),
                    measurementTimes: measurementTimes.join(",")
                }
            ];

        } else {
            aggregates = [
                ...aggregates,
                {
                    _id: `${reading.sensorId}-${day}-${source}-${measurement.type}`,
                    sensorId: reading.sensorId,
                    day: day,
                    source: source,
                    measurementType: measurement.type,
                    unitOfMeasurement: measurement.unitOfMeasurement,
                    measurementValues: measurement.value.toString(),
                    measurementTimes: moment.utc(reading.date).valueOf().toString()
                }
            ];
        }
    }

    return aggregates;
}
