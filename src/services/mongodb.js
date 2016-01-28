import {MongoClient} from "mongodb";
import {memoize} from "ramda";

const connect = memoize(url => MongoClient.connect(url));

export function upsert ({url, collectionName, query, modifier}) {
    return connect(url)
        .then(db => db.collection(collectionName).update(
            query, modifier, {upsert: true}
        ));
}

export function findOne ({url, collectionName, query}) {
    return connect(url)
        .then(db => db.collection(collectionName).findOne(
            query
        ));
}

export function findAll ({url, collectionName, query}) {
    return connect(url)
        .then(db => db.collection(collectionName).find(
            query
        ));
}
