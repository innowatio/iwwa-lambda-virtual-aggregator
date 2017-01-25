import moment from "moment";
import {contains} from "ramda";

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
        sensorId
    } = reading;

    const source = reading.source || reading.measurements[0].source;

    const day = moment.utc(date).format("YYYY-MM-DD");
    const measurementTypes = reading.measurements.map(x => x.type);

    const readingVariable = formula.variables.find(x => x.sensorId === sensorId);
    if (!readingVariable || !contains(readingVariable.measurementType, measurementTypes)) {
        return [];
    }

    return formula.variables.map(variable => {
        if (variable.sensorId === sensorId && contains(variable.measurementType, measurementTypes)) {
            return;
        }
        return `${variable.sensorId}-${day}-${source}-${variable.measurementType}`;
    }).filter(x => x);
}

export function findSensorsAggregates(reading, formula) {
    const ids = getIds(formula, reading);
    return findAggregates(ids);
}
