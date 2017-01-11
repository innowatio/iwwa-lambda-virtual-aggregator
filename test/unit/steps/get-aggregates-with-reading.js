import {expect} from "chai";

import {getMongoClient} from "services/mongodb";
import {AGGREGATES_COLLECTION_NAME} from "config";

import {getAggregatesWithReading} from "steps/get-aggregates-with-reading";

describe("Insert reading in aggregate", () => {

    const date = "1970-01-01T00:00:01.500Z";
    const reading = [{
        sensorId: "sensorId-0",
        date: "1970-01-01T00:00:01.500Z",
        source: "reading",
        measurementType: "activeEnergy",
        measurementValue: 50,
        measurementUnit: "kWh"
    }, {
        sensorId: "sensorId-0",
        date: "1970-01-01T00:00:01.500Z",
        source: "reading",
        measurementType: "reactiveEnergy",
        measurementValue: 150,
        measurementUnit: "kVARh"
    }];
    
    let db;

    before(async () => {
        db = await getMongoClient();
    });

    afterEach(async () => {
        db.collection(AGGREGATES_COLLECTION_NAME).remove({});
    });

    it("Create a new aggregate", async () => {

        const result = await getAggregatesWithReading(date, reading);

        expect(result).to.be.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-activeEnergy",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "activeEnergy",
            unitOfMeasurement: "kWh",
            measurementValues: "50",
            measurementTimes: "1500"
        }, {
            _id: "sensorId-0-1970-01-01-reading-reactiveEnergy",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "reactiveEnergy",
            unitOfMeasurement: "kVARh",
            measurementValues: "150",
            measurementTimes: "1500"
        }]);

    });

    it("Insert reading in aggregate", async () => {

        await db.collection(AGGREGATES_COLLECTION_NAME).insert({
            _id: "sensorId-0-1970-01-01-reading-reactiveEnergy",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "reactiveEnergy",
            unitOfMeasurement: "kVARh",
            measurementValues: "75",
            measurementTimes: "2500"
        });

        const result = await getAggregatesWithReading(date, reading);

        expect(result).to.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-activeEnergy",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "activeEnergy",
            unitOfMeasurement: "kWh",
            measurementValues: "50",
            measurementTimes: "1500"
        }, {
            _id: "sensorId-0-1970-01-01-reading-reactiveEnergy",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "reactiveEnergy",
            unitOfMeasurement: "kVARh",
            measurementValues: "150,75",
            measurementTimes: "1500,2500"
        }]);

    });

    it("Replace reading in aggregate", async () => {

        await db.collection(AGGREGATES_COLLECTION_NAME).insert({
            _id: "sensorId-0-1970-01-01-reading-reactiveEnergy",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "reactiveEnergy",
            unitOfMeasurement: "kVARh",
            measurementValues: "90",
            measurementTimes: "1500"
        });

        const result = await getAggregatesWithReading(date, reading);

        expect(result).to.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-activeEnergy",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "activeEnergy",
            unitOfMeasurement: "kWh",
            measurementValues: "50",
            measurementTimes: "1500"
        }, {
            _id: "sensorId-0-1970-01-01-reading-reactiveEnergy",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "reactiveEnergy",
            unitOfMeasurement: "kVARh",
            measurementValues: "150",
            measurementTimes: "1500"
        }]);

    });
});
