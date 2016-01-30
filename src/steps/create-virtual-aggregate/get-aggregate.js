import moment from "moment";

import {AGGREGATES_COLLECTION_NAME} from "../../config";
import mongodb from "../../services/mongodb";

function getDayFromReading (date) {
    return moment.utc(date, moment.ISO_8601, true).format("YYYY-MM-DD");
}

export default async function getAggregate (sensorId, measurementType, source, date) {
    const db = await mongodb;
    const query = {
        sensorId,
        day: getDayFromReading(date),
        source,
        measurementType
    };
    return await db.collection(AGGREGATES_COLLECTION_NAME).findOne(query);
}
