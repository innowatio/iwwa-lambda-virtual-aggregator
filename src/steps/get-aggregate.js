import moment from "moment";

import {AGGREGATES_COLLECTION_NAME} from "../services/config";
import mongodb from "../services/mongodb";

function getDayFromReading (date) {
    return moment.utc(date, moment.ISO_8601, true).format("YYYY-MM-DD");
}

export default async function getAggregate (reading) {
    const db = await mongodb;
    const query = {
        sensorId: reading.sensorId,
        date: getDayFromReading(reading.date),
        source: reading.source,
        measurementType: reading.measurementType
    };
    return await db.collection(AGGREGATES_COLLECTION_NAME).findOne(query);
}
