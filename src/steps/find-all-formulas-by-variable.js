import {FORMULAS_COLLECTION} from "../config";
import {getMongoClient} from "../services/mongodb";

export default async function findAllFormulaByVariable (variable) {
    const db = await getMongoClient();
    const query = {
        variables: {
            $in: [variable]
        }
    };
    return db.collection(FORMULAS_COLLECTION).find(query).toArray();
}
