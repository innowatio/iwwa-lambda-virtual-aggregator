import {AGGREGATES_COLLECTION_NAME} from "../config";
import mongodb from "../services/mongodb";

export default async function upsertAggregate (aggregate) {
    const db = await mongodb;
    return db.collection(AGGREGATES_COLLECTION_NAME).update(
        {_id: aggregate._id},
        aggregate,
        {upsert: true}
    );
}
