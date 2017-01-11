import {FORMULAS_COLLECTION} from "../config";
import {getMongoClient} from "../services/mongodb";

export async function findVirtualSensors (sensorId) {
    const db = await getMongoClient();
    const query = {
        sensorsIds: {
            $in: [sensorId]
        }
    };

    return await db.collection(FORMULAS_COLLECTION).find(query).toArray();
}
