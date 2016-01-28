import {resolve} from "bluebird";
import * as config from "./services/config";
import * as mongodb from "./services/mongodb";


export function findAllFormulaByVariable (variable) {
    return resolve(variable)
        .then(variable => mongodb.findAll({
            url: config.MONGODB_URL,
            collectionName: config.COLLECTION_FORMULAS,
            query: {
                id_result: {
                    $in: [variable]
                }
            }
        }));
}
