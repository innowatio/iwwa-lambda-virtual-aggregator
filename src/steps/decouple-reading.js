export function decoupleReading (reading) {
    const {
        sensorId,
        date,
        source
    } = reading;
    return reading.measurements.map(measurement => {
        return {
            sensorId,
            date,
            source,
            measurementType: measurement.type,
            measurementUnit: measurement.unitOfMeasurement,
            measurementValue: measurement.value
        };
    });
}
