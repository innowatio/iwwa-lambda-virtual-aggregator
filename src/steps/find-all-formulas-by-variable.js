import {FORMULAS_COLLECTION} from "../config";
import mongodb from "../services/mongodb";

export default async function findAllFormulaByVariable (variable) {
    const db = await mongodb;
    const query = {
        variables: {
            $in: [variable]
        }
    };
    return db.collection(FORMULAS_COLLECTION).find(query).toArray();
}
