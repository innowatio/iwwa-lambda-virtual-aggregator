import {expect} from "chai";

import mongodb from "services/mongodb";
import * as config from "config";
import {getEventFromObject, run} from "../mocks";
import {getSensorWithSourceInMeasurements, getFormula} from "../utils";
import {handler} from "index";

describe("`iwwa-lambda-virtual-aggregator`", () => {

    var aggregates;
    var formulas;
    var db;

    const aggregateMockActiveEnergySensor2 = {
        _id: "sensor2-2016-01-28-reading-activeEnergy",
        sensorId: "sensor2",
        day: "2016-01-28",
        source: "reading",
        measurementType: "activeEnergy",
        unitOfMeasurement: "kWh",
        measurementValues: "1,2,3,4,5,6,7,8"
    };

    const aggregateMockReactiveEnergySensor2 = {
        _id: "sensor2-2016-01-28-reading-reactiveEnergy",
        sensorId: "sensor2",
        day: "2016-01-28",
        source: "reading",
        measurementType: "reactiveEnergy",
        unitOfMeasurement: "kVArh",
        measurementValues: "0.1,0.2,0.3,0.4"
    };

    const aggregateMockMaxPowerSensor2 = {
        _id: "sensor2-2016-01-28-reading-maxPower",
        sensorId: "sensor2",
        day: "2016-01-28",
        source: "reading",
        measurementType: "maxPower",
        unitOfMeasurement: "VAr",
        measurementValues: "0.6,0.7,0.8,0.9"
    };

    const aggregateMockActiveEnergySensor3 = {
        _id: "sensor3-2016-01-28-reading-activeEnergy",
        sensorId: "sensor3",
        day: "2016-01-28",
        source: "reading",
        measurementType: "activeEnergy",
        unitOfMeasurement: "kWh",
        measurementValues: "0.1,0.2,0.3"
    };

    const aggregateMockReactiveEnergySensor3 = {
        _id: "sensor3-2016-01-28-reading-reactiveEnergy",
        sensorId: "sensor3",
        day: "2016-01-28",
        source: "reading",
        measurementType: "reactiveEnergy",
        unitOfMeasurement: "kVArh",
        measurementValues: "1,5,4,7,3,1,,0.1"
    };

    const aggregateMockMaxPowerSensor3 = {
        _id: "sensor3-2016-01-28-reading-maxPower",
        sensorId: "sensor3",
        day: "2016-01-28",
        source: "reading",
        measurementType: "maxPower",
        unitOfMeasurement: "VAr",
        measurementValues: ",,,3,6,5,,1"
    };

    const mockFormulas = {
        resultId: "site2",
        variables: ["sensor1", "sensor2", "sensor3"],
        formula: "sensor1+sensor2+sensor3"
    };

    before(async () => {
        db = await mongodb;
        aggregates = db.collection(config.AGGREGATES_COLLECTION_NAME);
        formulas = db.collection(config.FORMULAS_COLLECTION);
    });
    after(async () => {
        await db.dropCollection(config.AGGREGATES_COLLECTION_NAME);
        await db.dropCollection(config.FORMULAS_COLLECTION);
        await db.close();
    });
    beforeEach(async () => {
        await aggregates.remove({});
        await formulas.remove({});
        await aggregates.insert(aggregateMockActiveEnergySensor2);
        await formulas.insert(getFormula());
    });

    describe("creates a new aggregate for virtual measurement in the reading", () => {

        it("with `activeEnergy` measurement", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );
            await run(handler, event);
            const count = await aggregates.count({});
            expect(count).to.equal(2);
        });

        it("with `activeEnergy`, `reactiveEnergy` and `maxPower` measurements", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );
            await aggregates.insert(aggregateMockReactiveEnergySensor2);
            await aggregates.insert(aggregateMockMaxPowerSensor2);
            await run(handler, event);
            const count = await aggregates.count({});
            expect(count).to.equal(6);
        });

        it("with 3 `measurementType` and 2 `formulas`", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );
            await aggregates.insert(aggregateMockReactiveEnergySensor2);
            await aggregates.insert(aggregateMockMaxPowerSensor2);
            await aggregates.insert(aggregateMockActiveEnergySensor3);
            await aggregates.insert(aggregateMockReactiveEnergySensor3);
            await aggregates.insert(aggregateMockMaxPowerSensor3);
            await formulas.insert(mockFormulas);
            await run(handler, event);
            const count = await aggregates.count({});
            expect(count).to.equal(12);
        });

    });

    describe("correctly builds the virtual aggregate:", () => {

        it("with the `measurementValues` at the right position as sum of `measurementValues` of sensors in `formula`", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:22:36.389Z", "reading")
            );
            await run(handler, event);
            const aggregate1 = await aggregates.findOne({_id: "site-2016-01-28-reading-activeEnergy"});
            expect(aggregate1).to.deep.equal({
                _id: "site-2016-01-28-reading-activeEnergy",
                sensorId: "site",
                day: "2016-01-28",
                source: "reading",
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: ",,,,5.808",
                measurementsDeltaInMs: 300000
            });
        });

        it("with a correct virtual aggregate for every `measurementType`", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );
            await aggregates.insert(aggregateMockReactiveEnergySensor2);
            await aggregates.insert(aggregateMockMaxPowerSensor2);
            await run(handler, event);
            const aggregate1 = await aggregates.findOne({_id: "site-2016-01-28-reading-activeEnergy"});
            expect(aggregate1).to.deep.equal({
                _id: "site-2016-01-28-reading-activeEnergy",
                sensorId: "site",
                day: "2016-01-28",
                source: "reading",
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: ",,,4.808",
                measurementsDeltaInMs: 300000
            });
            const aggregate2 = await aggregates.findOne({_id: "site-2016-01-28-reading-reactiveEnergy"});
            expect(aggregate2).to.deep.equal({
                _id: "site-2016-01-28-reading-reactiveEnergy",
                sensorId: "site",
                day: "2016-01-28",
                source: "reading",
                measurementType: "reactiveEnergy",
                unitOfMeasurement: "kVArh",
                measurementValues: ",,,0.315",
                measurementsDeltaInMs: 300000
            });
            const aggregate3 = await aggregates.findOne({_id: "site-2016-01-28-reading-maxPower"});
            expect(aggregate3).to.deep.equal({
                _id: "site-2016-01-28-reading-maxPower",
                sensorId: "site",
                day: "2016-01-28",
                source: "reading",
                measurementType: "maxPower",
                unitOfMeasurement: "VAr",
                measurementValues: ",,,0.9",
                measurementsDeltaInMs: 300000
            });
        });

        it("create a correct virtual aggregate for every `measurementType` and every `formulas`", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );
            await aggregates.insert(aggregateMockReactiveEnergySensor2);
            await aggregates.insert(aggregateMockMaxPowerSensor2);
            await aggregates.insert(aggregateMockActiveEnergySensor3);
            await aggregates.insert(aggregateMockReactiveEnergySensor3);
            await aggregates.insert(aggregateMockMaxPowerSensor3);
            await formulas.insert(mockFormulas);
            await run(handler, event);
            const aggregate1 = await aggregates.findOne({_id: "site-2016-01-28-reading-activeEnergy"});
            const aggregate2 = await aggregates.findOne({_id: "site-2016-01-28-reading-reactiveEnergy"});
            const aggregate3 = await aggregates.findOne({_id: "site-2016-01-28-reading-maxPower"});
            const aggregate4 = await aggregates.findOne({_id: "site2-2016-01-28-reading-activeEnergy"});
            const aggregate5 = await aggregates.findOne({_id: "site2-2016-01-28-reading-reactiveEnergy"});
            const aggregate6 = await aggregates.findOne({_id: "site2-2016-01-28-reading-maxPower"});
            expect(aggregate1).to.deep.equal({
                _id: "site-2016-01-28-reading-activeEnergy",
                sensorId: "site",
                day: "2016-01-28",
                source: "reading",
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: ",,,4.808",
                measurementsDeltaInMs: 300000
            });
            expect(aggregate2).to.deep.equal({
                _id: "site-2016-01-28-reading-reactiveEnergy",
                sensorId: "site",
                day: "2016-01-28",
                source: "reading",
                measurementType: "reactiveEnergy",
                unitOfMeasurement: "kVArh",
                measurementValues: ",,,0.315",
                measurementsDeltaInMs: 300000
            });
            expect(aggregate3).to.deep.equal({
                _id: "site-2016-01-28-reading-maxPower",
                sensorId: "site",
                day: "2016-01-28",
                source: "reading",
                measurementType: "maxPower",
                unitOfMeasurement: "VAr",
                measurementValues: ",,,0.9",
                measurementsDeltaInMs: 300000
            });
            expect(aggregate4).to.deep.equal({
                _id: "site2-2016-01-28-reading-activeEnergy",
                sensorId: "site2",
                day: "2016-01-28",
                source: "reading",
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "",
                measurementsDeltaInMs: 300000
            });
            expect(aggregate5).to.deep.equal({
                _id: "site2-2016-01-28-reading-reactiveEnergy",
                sensorId: "site2",
                day: "2016-01-28",
                source: "reading",
                measurementType: "reactiveEnergy",
                unitOfMeasurement: "kVArh",
                measurementValues: ",,,7.315",
                measurementsDeltaInMs: 300000
            });
            expect(aggregate6).to.deep.equal({
                _id: "site2-2016-01-28-reading-maxPower",
                sensorId: "site2",
                day: "2016-01-28",
                source: "reading",
                measurementType: "maxPower",
                unitOfMeasurement: "VAr",
                measurementValues: ",,,3.9",
                measurementsDeltaInMs: 300000
            });
        });

        it("return `null` if source is `forcast`", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2015-01-01T00:00:30.000Z", "forecast")
            );
            await run(handler, event);
            const counts = await aggregates.count({});
            expect(counts).to.deep.equal(1);
        });

        it("non-first day of the month [CASE: 1/2 (only testing different combinations)]", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:00:11.000Z", "reading")
            );
            await run(handler, event);
            const aggregate = await aggregates.findOne({_id: "site-2016-01-28-reading-activeEnergy"});
            expect(aggregate).to.deep.equal({
                _id: "site-2016-01-28-reading-activeEnergy",
                sensorId: "site",
                source: "reading",
                measurementType: "activeEnergy",
                day: "2016-01-28",
                measurementValues: "1.808",
                unitOfMeasurement: "kWh",
                measurementsDeltaInMs: 300000
            });
        });

        it("non-first day of the month [CASE: 2/2 (only testing different combinations)]", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:23:51.000Z", "reading")
            );
            await run(handler, event);
            const aggregate = await aggregates.findOne({_id: "site-2016-01-28-reading-activeEnergy"});
            expect(aggregate).to.deep.equal({
                _id: "site-2016-01-28-reading-activeEnergy",
                sensorId: "site",
                source: "reading",
                day: "2016-01-28",
                measurementType: "activeEnergy",
                measurementValues: ",,,,5.808",
                unitOfMeasurement: "kWh",
                measurementsDeltaInMs: 300000
            });
        });

    });

});
