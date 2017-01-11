import moment from "moment";

import {AGGREGATES_COLLECTION_NAME} from "../config";
import {getMongoClient} from "../services/mongodb";

async function findAggregates(ids) {
    const db = await getMongoClient();
    return await db.collection(AGGREGATES_COLLECTION_NAME).find({
        _id: {
            $in: ids
        }
    }).toArray();
}

function parseAggregate(reading, aggregate) {

    const {
        sensorId,
        date,
        source,
        measurementType,
        measurementValue,
        measurementUnit
    } = reading;

    const readingTime = moment.utc(date);
    const day = readingTime.format("YYYY-MM-DD");
    const millis = readingTime.valueOf().toString();

    if (aggregate) {

        const measurementTimes = aggregate.measurementTimes.split(",");
        const measurementValues = aggregate.measurementValues.split(",");

        let changed = false;
        let measurements = measurementTimes.map((time, index) => {
            return {
                time,
                value: measurementValues[index]
            };
        });

        for (let index = 0; index < measurements.length; index++) {
            let measurement = measurements[index];

            if (measurement.time === millis) {
                changed = true;
                measurements[index] = {
                    time: millis,
                    value: measurementValue
                };
            }
        }

        if (!changed) {
            measurements = [
                ...measurements,
                {
                    time: millis,
                    value: measurementValue
                }
            ];
        }

        const sorted = measurements.sort((x, y) => x.time - y.time);

        return {
            _id: `${sensorId}-${day}-${source}-${measurementType}`,
            day,
            sensorId,
            source,
            measurementType,
            unitOfMeasurement: measurementUnit,
            measurementValues: sorted.map(x => x.value).join(","),
            measurementTimes: sorted.map(x => x.time).join(",")
        };

    } else {
        return {
            _id: `${sensorId}-${day}-${source}-${measurementType}`,
            day,
            sensorId,
            source,
            measurementType,
            unitOfMeasurement: measurementUnit,
            measurementValues: `${measurementValue}`,
            measurementTimes: millis
        };
    }
}

export async function getAggregatesWithReading(date, decoupledReading) {

    const day = moment.utc(date).format("YYYY-MM-DD");

    const ids = decoupledReading.map(reading => {
        return `${reading.sensorId}-${day}-${reading.source}-${reading.measurementType}`;
    });

    const aggregates = await findAggregates(ids);

    return decoupledReading.map(reading => {
        const aggregate = aggregates.find(x => reading.measurementType === x.measurementType);
        return parseAggregate(reading, aggregate);
    });

}
