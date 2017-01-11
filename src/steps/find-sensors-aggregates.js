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

export function getIds(formula, reading) {

    const {
        date,
        source,
        sensorId
    } = reading;

    const day = moment.utc(date).format("YYYY-MM-DD");

    return formula.variables.map(variable => {
        if (variable.sensorId != sensorId) {
            return `${variable.sensorId}-${day}-${source}-${variable.measurementType}`;
        }
    }).filter(x => x);
}

export function findSensorsAggregates(reading, formula) {
    const ids = getIds(formula, reading);
    return findAggregates(ids);
}
