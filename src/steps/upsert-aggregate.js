import {AGGREGATES_COLLECTION_NAME} from "../common/config";
import mongodb from "../common/mongodb";

export default async function upsertAggregate (aggregate) {
    const db = await mongodb;
    return db.collection(AGGREGATES_COLLECTION_NAME).update(
        {_id: aggregate._id},
        aggregate,
        {upsert: true}
    );
}
