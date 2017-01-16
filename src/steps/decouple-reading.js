export function decoupleReading (reading) {
    const {
        sensorId,
        date
    } = reading;
    return reading.measurements.map(measurement => {
        return {
            sensorId,
            date,
            source: reading.source || reading.measurements[0].source,
            measurementType: measurement.type,
            measurementUnit: measurement.unitOfMeasurement,
            measurementValue: measurement.value
        };
    });
}
