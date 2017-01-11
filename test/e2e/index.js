import "babel-polyfill";

import chai, {expect} from "chai";
import {spy} from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import {getMongoClient} from "services/mongodb";
import {setInstance} from "services/dispatcher";
import {
    AGGREGATES_COLLECTION_NAME,
    FORMULAS_COLLECTION
} from "config";

import {getEventFromObject} from "../mocks";

import {handler} from "index";

describe("On reading event", () => {

    let db;
    let dispatcher;

    const context = {
        succeed: spy(),
        fail: spy()
    };

    const formula = {
        formula: "x/y",
        variables: [{
            symbol: "x",
            sensorId: "sensorId-0",
            measurementType: "temperature"
        }, {
            symbol: "y",
            sensorId: "sensorId-1",
            measurementType: "co2"
        }],
        start: "1970-01-01T00:00:00.000Z",
        end: "1970-01-02T00:00:00.000Z",
        measurementType: "customType",
        measurementUnit: "°C/ppm",
        measurementSample: 60000,
        aggregationType: "average"
    };

    const virtualSensor = {
        _id: "virtual-sensorId-0",
        sensorsIds: [
            "sensorId-0",
            "sensorId-1"
        ],
        formulas: [formula]
    };

    const reading = {
        sensorId: "sensorId-0",
        date: "1970-01-01T00:00:00.125Z",
        source: "reading",
        measurements: [{
            type: "activeEnergy",
            value: 59.5,
            unitOfMeasurement: "kWh"
        }, {
            type: "reactiveEnergy",
            value: 10.5,
            unitOfMeasurement: "kVARh"
        }, {
            type: "maxPower",
            value: 180,
            unitOfMeasurement: "kW"
        }]
    };

    before(async () => {
        db = await getMongoClient();
        dispatcher = setInstance(spy());
        await db.createCollection(FORMULAS_COLLECTION);
        await db.createCollection(AGGREGATES_COLLECTION_NAME);
    });

    after(async () => {
        await db.dropCollection(FORMULAS_COLLECTION);
        await db.dropCollection(AGGREGATES_COLLECTION_NAME);
    });

    beforeEach(async () => {
        dispatcher.reset();
        context.succeed.reset();
        context.fail.reset();

        await db.collection(FORMULAS_COLLECTION).remove({});
        await db.collection(AGGREGATES_COLLECTION_NAME).remove({});
    });

    afterEach(async () => {
        await db.collection(FORMULAS_COLLECTION).remove({});
        await db.collection(AGGREGATES_COLLECTION_NAME).remove({});
    });

    describe("Avoid dispatch", () => {

        it("Invalid reading", async () => {
            const event = getEventFromObject({
                data: {},
                type: "element inserted in collection readings"
            });

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);
            expect(dispatcher).to.have.callCount(0);
        });

        it("Invalid source in reading event", async () => {
            const event = getEventFromObject({
                data: {
                    element: {
                        sensorId: reading.sensorId,
                        source: "invalid"
                    }
                },
                type: "element inserted in collection readings"
            });

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);
            expect(dispatcher).to.have.callCount(0);
        });

        it("No virtual sensors affected", async () => {
            const event = getEventFromObject({
                data: {
                    element: {
                        reading
                    }
                },
                type: "element inserted in collection readings"
            });

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);
            expect(dispatcher).to.have.callCount(0);
        });

        it("No aggregates", async () => {
            const event = getEventFromObject({
                data: {
                    element: reading
                },
                type: "element inserted in collection readings"
            });

            await db.collection(FORMULAS_COLLECTION).insert(virtualSensor);

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);
            expect(dispatcher).to.have.callCount(0);
        });

        it("Aggregates older than reading", async () => {

            const event = getEventFromObject({
                data: {
                    element: {
                        sensorId: "sensorId-0",
                        date: "1970-01-02T00:00:00.500Z",
                        source: "reading",
                        measurements: [{
                            type: "temperature",
                            value: 22,
                            unitOfMeasurement: "°C"
                        }]
                    }
                },
                type: "element inserted in collection readings"
            });

            await db.collection(FORMULAS_COLLECTION).insert(virtualSensor);

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-0-1970-01-01-reading-temperature",
                day: "1970-01-01",
                sensorId: "sensorId-0",
                source: "reading",
                measurementType: "temperature",
                unitOfMeasurement: "°C",
                measurementValues: "1,2,2,2,2,2,2,2,2,3",
                measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
            });

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-1-1970-01-01-reading-co2",
                day: "1970-01-01",
                sensorId: "sensorId-1",
                source: "reading",
                measurementType: "co2",
                unitOfMeasurement: "°C",
                measurementValues: "1,2,2,2,2,2,2,2,2,3",
                measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
            });

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);
            expect(dispatcher).to.have.callCount(0);
        });

        it("Aggregates with different measurementType", async () => {

            const event = getEventFromObject({
                data: {
                    element: reading
                },
                type: "element inserted in collection readings"
            });

            await db.collection(FORMULAS_COLLECTION).insert(virtualSensor);

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-0-1970-01-01-reading-temperature",
                day: "1970-01-01",
                sensorId: "sensorId-0",
                source: "reading",
                measurementType: "temperature",
                unitOfMeasurement: "°C",
                measurementValues: "1,2,2,2,2,2,2,2,2,3",
                measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
            });

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-1-1970-01-01-reading-co2",
                day: "1970-01-01",
                sensorId: "sensorId-1",
                source: "reading",
                measurementType: "co2",
                unitOfMeasurement: "°C",
                measurementValues: "1,2,2,2,2,2,2,2,2,3",
                measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
            });

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);
            expect(dispatcher).to.have.callCount(0);
        });

    });

    describe("Dispatch event", () => {

        it("With no aggregates but with reading event with enough measurements", async () => {

            const event = getEventFromObject({
                data: {
                    element: reading
                },
                type: "element inserted in collection readings"
            });

            await db.collection(FORMULAS_COLLECTION).insert({
                ...virtualSensor,
                formulas: [{
                    ...formula,
                    formula: "x + y + z",
                    variables: [{
                        symbol: "x",
                        sensorId: reading.sensorId,
                        measurementType: "activeEnergy"
                    }, {
                        symbol: "y",
                        sensorId: reading.sensorId,
                        measurementType: "reactiveEnergy"
                    }, {
                        symbol: "z",
                        sensorId: reading.sensorId,
                        measurementType: "maxPower"
                    }]
                }]
            });

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);

            const expected = {
                sensorId: "virtual-sensorId-0",
                source: reading.source,
                date: "1970-01-01T00:00:00Z",
                measurements: [{
                    type: "customType",
                    unitOfMeasurement: "°C/ppm",
                    value: 250
                }]
            };

            expect(dispatcher).to.have.callCount(1);
            expect(dispatcher).to.have.calledWith("element inserted in collection readings", expected, {});
        });

        it("With aggregates and partial reading", async () => {

            const event = getEventFromObject({
                data: {
                    element: {
                        sensorId: "sensorId-0",
                        date: "1970-01-01T00:00:00.500Z",
                        source: "reading",
                        measurements: [{
                            type: "temperature",
                            value: 22,
                            unitOfMeasurement: "°C"
                        }]
                    }
                },
                type: "element inserted in collection readings"
            });

            await db.collection(FORMULAS_COLLECTION).insert(virtualSensor);

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-0-1970-01-01-reading-temperature",
                day: "1970-01-01",
                sensorId: "sensorId-0",
                source: "reading",
                measurementType: "temperature",
                unitOfMeasurement: "°C",
                measurementValues: "1,2,2,2,2,2,2,2,2,3",
                measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
            });

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-1-1970-01-01-reading-co2",
                day: "1970-01-01",
                sensorId: "sensorId-1",
                source: "reading",
                measurementType: "co2",
                unitOfMeasurement: "°C",
                measurementValues: "1,2,2,2,2,2,2,2,2,3",
                measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
            });

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);

            const expected = {
                sensorId: "virtual-sensorId-0",
                source: reading.source,
                date: "1970-01-01T00:00:00Z",
                measurements: [{
                    type: "customType",
                    unitOfMeasurement: "°C/ppm",
                    value: 2
                }]
            };

            expect(dispatcher).to.have.callCount(1);
            expect(dispatcher).to.have.calledWith("element inserted in collection readings", expected, {});
        });

    });

});
