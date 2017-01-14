import moment from "moment";

import {FORMULAS_COLLECTION} from "../config";
import {getMongoClient} from "../services/mongodb";

export async function findVirtualSensors (sensorId, readingDate) {
    const db = await getMongoClient();
    const query = {
        sensorsIds: {
            $in: [sensorId]
        }
    };

    const virtualSensors = await db.collection(FORMULAS_COLLECTION).find(query).toArray();

    const millis = moment.utc(readingDate).valueOf();

    return virtualSensors.map(sensor => {

        const formulas = sensor.formulas.filter(x => {
            const startMillis = moment.utc(x.start).valueOf();
            const endMillis = moment.utc(x.end).valueOf();
            return startMillis <= millis && millis <= endMillis;
        });

        return {
            ...sensor,
            formulas
        };
    });
}
