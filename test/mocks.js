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

export function getReading (source="reading") {
    return {
        "sensorId": "sensorId",
        "date": new Date(),
        "source": source,
        "measurements": [
            {
                "type": "activeEnergy",
                "value": "0.808",
                "unitOfMeasurement": "kWh"
            },
            {
                "type": "reactiveEnergy",
                "value": "-0.085",
                "unitOfMeasurement": "kVArh"
            },
            {
                "type": "maxPower",
                "value": "0.000",
                "unitOfMeasurement": "VAr"
            }
        ]
    };
}
