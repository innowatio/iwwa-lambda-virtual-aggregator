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

export function getReadingWithMultipleMeasurements () {
    return {
        "sensorId": "sensor1",
        "date": "2016-01-28T00:16:36.389Z",
        "source": "reading",
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
        resultId: "site",
        variables: ["sensor1", "sensor2"],
        formulaString: "sensor1+sensor2"
    };
}
