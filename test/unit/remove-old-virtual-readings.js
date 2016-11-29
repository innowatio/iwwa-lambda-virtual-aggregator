import {expect} from "chai";

import {
    ALLOWED_SOURCES,
    AGGREGATES_COLLECTION_NAME
} from "config";
import {getMongoClient} from "services/mongodb";
import {removeOldVirtualReadings} from "steps/remove-old-virtual-readings";

describe("removeOldVirtualReadings", () => {

    let db;
    const sources = ALLOWED_SOURCES;

    beforeEach(async () => {
        db = await getMongoClient();
        await db.collection(AGGREGATES_COLLECTION_NAME).remove({});
    });

    sources.forEach(source => {

        it(`remove old virtual sensor's with source: '${source}'`, async () => {

            const type = "activeEnergy";
            const reading = {
                sensorId: "sensor1",
                date: "2016-11-29T09:30:00.000Z",
                source,
                measurements: [{
                    type,
                    value: "0.808",
                    unitOfMeasurement: "kWh"
                }]
            };

            const aggregateBefore = {
                _id: `sensor1-2016-11-29-${source}-${type}`,
                day: "2016-11-29",
                sensorId: "sensor1",
                source,
                measurementType: type,
                unitOfMeasurement: "kWh",
                measurementValues: "0,0,0,0,0,0,16.2,17.6,17.3,8.8,10.2,11.7,13.2,14.6,16.1,17.5,17.3,2.7,4.2,5.6,7.1,8.5,10,11.5,12.9,17.2,8.4",
                measurementTimes: "1480377600000,1480381200000,1480384800000,1480388400000,1480392000000,1480395600000,1480399200000,1480402800000,1480406400000,1480410000000,1480411800000,1480412100000,1480412400000,1480412700000,1480413000000,1480413300000,1480413600000,1480413900000,1480414200000,1480414500000,1480414800000,1480415100000,1480415400000,1480415700000,1480416000000,1480417200000,1480420800000"
            };

            await db.collection(AGGREGATES_COLLECTION_NAME).insert(aggregateBefore);

            const result = await removeOldVirtualReadings(reading.sensorId, reading.source, type, reading.date, 3600000);

            const aggregateAfter = await db.collection(AGGREGATES_COLLECTION_NAME).findOne({
                _id: aggregateBefore._id
            });

            const expected = {
                _id: `sensor1-2016-11-29-${source}-${type}`,
                day: "2016-11-29",
                sensorId: "sensor1",
                source,
                measurementType: type,
                unitOfMeasurement: "kWh",
                measurementValues: "0,0,0,0,0,0,16.2,17.6,17.3,17.3,2.7,4.2,5.6,7.1,8.5,10,11.5,12.9,17.2,8.4",
                measurementTimes: "1480377600000,1480381200000,1480384800000,1480388400000,1480392000000,1480395600000,1480399200000,1480402800000,1480406400000,1480413600000,1480413900000,1480414200000,1480414500000,1480414800000,1480415100000,1480415400000,1480415700000,1480416000000,1480417200000,1480420800000"
            };

            expect(result).to.be.deep.equal(expected);
            expect(aggregateAfter).to.be.deep.equal(expected);

        });

    });

});
