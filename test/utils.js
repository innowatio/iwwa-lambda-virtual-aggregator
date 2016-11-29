import moment from "moment";

export function getSensorWithSourceInMeasurements (date, source) {
    return {
        "id": "eventId",
        "data": {
            "element": {
                "sensorId": "sensor1",
                "date": date,
                "measurements": [
                    {
                        "type": "activeEnergy",
                        "source": source,
                        "value": "0.808",
                        "unitOfMeasurement": "kWh"
                    },
                    {
                        "type": "reactiveEnergy",
                        "source": source,
                        "value": "-0.085",
                        "unitOfMeasurement": "kVArh"
                    },
                    {
                        "type": "maxPower",
                        "source": source,
                        "value": "0.000",
                        "unitOfMeasurement": "VAr"
                    }
                ]
            },
            "id": "electricalReadingId"
        },
        "timestamp": 1420070400000,
        "type": "element inserted in collection readings"
    };
}

export function getReading ({source="forecast", type="temperature"}) {
    return {
        "sensorId": "sensor1",
        "date": "2016-01-28T00:16:36.389Z",
        "source": source,
        "measurements": [
            {
                "type": type,
                "value": "0.808",
                "unitOfMeasurement": "kWh"
            }
        ]
    };
}

export function getReadingWithMultipleMeasurements (source = "reading") {
    return {
        "sensorId": "sensor1",
        "date": "2016-01-28T00:16:36.389Z",
        source,
        "measurements": [
            {
                "type": "activeEnergy",
                "value": "1.1",
                "unitOfMeasurement": "kWh"
            }, {
                "type": "temperature",
                "value": "2.2",
                "unitOfMeasurement": "kWh"
            }, {
                "type": "maxPower",
                "value": "3.3",
                "unitOfMeasurement": "kWh"
            }
        ]
    };
}

export function getFormula () {
    return {
        _id: "site",
        variables: ["sensor1", "sensor2"],
        measurementType: [
            "activeEnergy",
            "temperature",
            "maxPower"
        ],
        formulas: [
            {
                formula: "sensor1+sensor2",
                measurementType: ["activeEnergy", "maxPower"],
                variables: ["sensor1", "sensor2"],
                sampleDeltaInMS: moment.duration(5, "minutes").asMilliseconds(),
                start: "1900-01-01T00:00:00.000Z",
                end: "2100-01-01T00:00:00.000Z"
            },
            {
                formula: "sensor1+sensor2",
                measurementType: ["temperature"],
                variables: ["sensor1", "sensor2"],
                sampleDeltaInMS: moment.duration(5, "minutes").asMilliseconds(),
                start: "1900-01-01T00:00:00.000Z",
                end: "2100-01-01T00:00:00.000Z"
            }
        ]
    };
}
