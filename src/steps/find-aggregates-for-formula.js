import moment from "moment";

import {
    AGGREGATES_COLLECTION_NAME
} from "../config";
import {
    getMongoClient
} from "../services/mongodb";
import log from "../services/logger";

export function computeIds(formula, date, source) {
    const aggregatesIds = formula.variables.map(variable => {
        const day = moment.utc(date).format("YYYY-MM-DD");
        return `${variable}-${day}-${source}-${formula.measurementType}`;
    });
    log.info({aggregatesIds});
    return aggregatesIds;
}

export async function findAggregatesForFormula (formula, date, source) {
    const db = await getMongoClient();
    const query = {
        _id: {
            $in: computeIds(formula, date, source)
        }
    };
    const aggregates = await db.collection(AGGREGATES_COLLECTION_NAME).find(query).toArray();
    return aggregates;
}
