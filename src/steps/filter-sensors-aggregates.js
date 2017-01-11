import moment from "moment";

export function filterSensorsAggregates(reading, formula, aggregates) {

    const {
        date
    } = reading;

    const {
        measurementSample
    } = formula;

    const startMillis = moment.utc(date).valueOf() - moment.utc(date).valueOf() % measurementSample;
    const endMillis = startMillis + measurementSample;

    return aggregates.map(aggregate => {
        const {
            _id,
            day,
            sensorId,
            source,
            measurementType,
            unitOfMeasurement,
        } = aggregate;

        const measurementTimes = aggregate.measurementTimes.split(",");
        const measurementValues = aggregate.measurementValues.split(",");

        const measurements = measurementTimes.map((time, index) => {
            return {
                time: parseInt(time),
                value: measurementValues[index]
            };
        }).filter(x => startMillis <= x.time && x.time <= endMillis);

        if (measurements.length != 0) {
            return {
                _id,
                day,
                sensorId,
                source,
                measurementType,
                unitOfMeasurement,
                measurementValues: measurements.map(x => x.value).join(","),
                measurementTimes: measurements.map(x => x.time).join(",")
            };
        }
    }).filter(x => x);
}
