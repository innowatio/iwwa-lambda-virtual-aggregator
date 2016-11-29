import moment from "moment";
import inRange from "lodash.inrange";

import {
    AGGREGATES_COLLECTION_NAME
} from "../config";
import {
    getMongoClient
} from "../services/mongodb";
import log from "../services/logger";

export async function removeOldVirtualReadings(sensorId, source, measurementType, readingDate, sampleDelta) {
    const id = `${sensorId}-${moment.utc(readingDate).format("YYYY-MM-DD")}-${source}-${measurementType}`;

    const db = await getMongoClient();
    const aggregate = await db.collection(AGGREGATES_COLLECTION_NAME).findOne({
        _id: id
    });

    if (aggregate) {

        const startTime = moment.utc(readingDate).valueOf() - moment.utc(readingDate).valueOf() % sampleDelta;
        const endTime = startTime + sampleDelta;

        const values = aggregate.measurementValues.split(",");
        const times = aggregate.measurementTimes.split(",");

        const mappedReadings = values.map((value, index) => {
            return {
                value,
                time: times[index]
            };
        }).filter(x => !inRange(x.time, startTime, endTime));

        const updatedAggregate = {
            ...aggregate,
            measurementValues: mappedReadings.map(x => x.value).join(","),
            measurementTimes: mappedReadings.map(x => x.time).join(",")
        };
        log.debug({updatedAggregate});

        await db.collection(AGGREGATES_COLLECTION_NAME).update({
            _id: id
        }, updatedAggregate);

        return updatedAggregate;
    }

}
