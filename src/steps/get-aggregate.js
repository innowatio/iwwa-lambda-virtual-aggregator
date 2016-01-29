import moment from "moment";

import {AGGREGATES_COLLECTION_NAME} from "../common/config";
import mongodb from "../common/mongodb";

function getDayFromReading (date) {
    return moment.utc(date, moment.ISO_8601, true).format("YYYY-MM-DD");
}

function getAggregateId (reading) {
    const {sensor, date, source, measurementType} = reading;
    return `${sensor}-${getDayFromReading(date)}-${source}-${measurementType}`;
}

export default async function getOrCreateAggregate (reading) {
    const db = await mongodb;
    const aggregate = await db
        .collection(AGGREGATES_COLLECTION_NAME)
        .findOne({_id: getAggregateId(reading)});
    return aggregate;
}
