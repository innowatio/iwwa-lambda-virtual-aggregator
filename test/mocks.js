function objectToBase64 (object) {
    return new Buffer(
        JSON.stringify(object)
    ).toString("base64");
}

export function getRecordFromObject (object) {
    return {
        "eventID": "shardId-000000000000:00000000000000000000000000000000000000000000000000000000",
        "eventVersion": "1.0",
        "kinesis": {
            "partitionKey": "partitionKey-0",
            "data": objectToBase64(object),
            "kinesisSchemaVersion": "1.0",
            "sequenceNumber": "00000000000000000000000000000000000000000000000000000000"
        },
        "invokeIdentityArn": "arn:aws:iam::EXAMPLE",
        "eventName": "aws:kinesis:record",
        "eventSourceARN": "arn:aws:kinesis:EXAMPLE",
        "eventSource": "aws:kinesis",
        "awsRegion": "us-east-1"
    };
}

export function getReading ({source="forecast", type="temperature"}) {
    return {
        "sensorId": "sensorId",
        "date": new Date(),
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
        "sensorId": "sensorId",
        "date": new Date(),
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
        "resultId": "Pod1",
        "variables": ["ANZ01", "ANZ02"],
        "formula": "ANZ01+ANZ02"
    };
}
