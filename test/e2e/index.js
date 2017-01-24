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
                        ...reading,
                        sensorId: "sensorId-5"
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

        it("Formula no longer active", async () => {

            const event = getEventFromObject({
                data: {
                    element: {
                        sensorId: "sensorId-0",
                        date: "1970-01-05T00:00:00.000Z",
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
                _id: "sensorId-0-1970-01-05-reading-temperature",
                day: "1970-01-05",
                sensorId: "sensorId-0",
                source: "reading",
                measurementType: "temperature",
                unitOfMeasurement: "°C",
                measurementValues: "21,22,22",
                measurementTimes: "345600000,345601000,345602000"
            });

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-1-1970-01-05-reading-co2",
                day: "1970-01-05",
                sensorId: "sensorId-1",
                source: "reading",
                measurementType: "co2",
                unitOfMeasurement: "°C",
                measurementValues: "80,100,120",
                measurementTimes: "345600000,345601000,345602000"
            });

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
                element: {
                    sensorId: "virtual-sensorId-0",
                    source: reading.source,
                    date: "1970-01-01T00:00:00Z",
                    measurements: [{
                        type: "customType",
                        unitOfMeasurement: "°C/ppm",
                        value: 250
                    }]
                }
            };

            expect(dispatcher).to.have.callCount(1);
            expect(dispatcher).to.have.calledWith("element inserted in collection readings", expected, {});
        });

        it("With aggregates and partial reading: formula 'x / y' aggregationType: 'average'", async () => {

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
                element: {
                    sensorId: "virtual-sensorId-0",
                    source: reading.source,
                    date: "1970-01-01T00:00:00Z",
                    measurements: [{
                        type: "customType",
                        unitOfMeasurement: "°C/ppm",
                        value: 2
                    }]
                }
            };

            expect(dispatcher).to.have.callCount(1);
            expect(dispatcher).to.have.calledWith("element inserted in collection readings", expected, {});
        });

        it("With aggregates and partial reading: formula 'x + y' aggregationType: 'sum'", async () => {

            const event = getEventFromObject({
                data: {
                    element: {
                        sensorId: "sensorId-0",
                        date: "2016-09-01T16:05:00.234Z",
                        source: "reading",
                        measurements: [{
                            type: "activeEnergy",
                            value: 0,
                            unitOfMeasurement: "kW"
                        }]
                    }
                },
                type: "element inserted in collection readings"
            });

            await db.collection(FORMULAS_COLLECTION).insert({
                ...virtualSensor,
                formulas: [{
                    ...formula,
                    start: "1970-01-01T00:00:00.000Z",
                    end: "2500-01-01T00:00:00.000Z",
                    aggregationType: "sum",
                    measurementSample: 3600000,
                    measurementUnit: "kWh",
                    measurementType: "activeEnergy",
                    formula: "x + y",
                    variables: [{
                        symbol: "x",
                        sensorId: "sensorId-0",
                        measurementType: "activeEnergy"
                    }, {
                        symbol: "y",
                        sensorId: "sensorId-1",
                        measurementType: "activeEnergy"
                    }]
                }]
            });

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-0-2016-09-01-reading-activeEnergy",
                day: "2016-09-01",
                sensorId: "sensorId-0",
                source: "reading",
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1.7,2.8,5.7,4,2.7,2.9,4.8,2.7,2.7,2.5,7.5,5.8,2.8,3,4.3,4.3,4.3,3.9,4.3,4.4,4.4,4.6,5.4,3.6,5.4,7.3,9.3,4.7,4.6,4.6,4.6,4.6,3.5,0.7,0.7,0.7,0.7,1.9,2.5,3.8,4.1,4.6,4.5,4.6,4,2.1,2.2,4.1,4.6,4.5,4.6,4.6,3.6,4.5,4.5,4.6,4.4,4.5,4.5,4.5,4.4,4.5,4.4,4.4,4.3,4.5,3.4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
                measurementTimes: "1472688300000,1472688900000,1472689500000,1472690100000,1472690700000,1472691300000,1472691900000,1472694300000,1472694900000,1472695500000,1472696700000,1472697300000,1472697900000,1472699100000,1472699700000,1472700300000,1472700900000,1472702700000,1472704500000,1472705700000,1472706300000,1472708700000,1472709300000,1472709900000,1472710500000,1472711700000,1472712300000,1472712900000,1472713500000,1472714100000,1472715300000,1472715900000,1472716500000,1472720700000,1472721900000,1472723100000,1472723700000,1472726700000,1472727900000,1472728500000,1472729700000,1472730300000,1472730900000,1472732700000,1472733300000,1472733900000,1472734500000,1472736300000,1472736900000,1472738700000,1472739600000,1472739900000,1472740200000,1472740500000,1472741100000,1472741400000,1472742000000,1472742300000,1472743200000,1472743500000,1472744100000,1472744400000,1472744700000,1472745000000,1472745300000,1472745600000,1472745900000,1472746200000,1472746500000,1472746800000,1472747100000,1472747700000,1472748000000,1472748300000,1472748600000,1472749200000,1472749500000,1472749800000,1472750100000,1472750700000,1472751000000,1472751300000,1472751600000,1472751900000,1472752200000,1472752500000,1472752800000,1472753100000,1472753400000,1472753700000,1472754300000,1472754600000,1472754900000,1472755200000,1472755500000,1472756100000,1472756400000,1472756700000,1472757000000,1472757300000,1472757600000,1472757900000,1472758200000,1472758500000,1472758800000,1472759100000,1472759400000,1472759700000,1472760000000,1472760300000,1472760600000,1472760900000,1472761200000,1472761500000,1472761800000,1472762100000,1472762400000,1472762700000,1472763000000,1472763300000,1472763600000,1472763900000,1472764500000,1472764800000,1472765400000,1472765700000,1472766000000,1472766300000,1472766900000"
            });

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-1-2016-09-01-reading-activeEnergy",
                day: "2016-09-01",
                sensorId: "sensorId-1",
                source: "reading",
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "1.3,1.4,1.4,1.3,1.4,1.2,1.4,1.4,1.4,1.4,1.3,1.4,1.4,1.4,1.3,1.3,1.4,1.3,1.4,1.4,1.3,1.4,1.3,1.3,1.4,1.3,1.2,1.3,1.3,1.3,1.3,0.9,1,0.9,0.9,0.9,1,2.1,5.3,6.4,6.3,6.3,6.3,5.6,6.3,6.2,6.3,6.2,6.2,6.2,6.3,5.7,6.3,6.3,6.3,6.2,6.2,6.2,6.3,6.2,6.2,6.2,5.6,6.2,6.2,6.2,6.2,6.1,6.2,5.5,6.2,6.3,6.1,6.2,3.1,3.1,3.1,3.1,3,3.1,3.1,3.1,3.1,3.1,2.5,3.1,3.1,3.1,3.2,3.1,3.1,3.1,3.1,3.2,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3,3.2,3.1,2.5,3.1,3.3,3.3,3.2,3.3,3.3,3.3,3.3,3.3,3.2,3.4,3.3,3.3,3.3,3.3,3.3,3.2,2.3,2.8,2.9,1.5,0.8,0.9,0.8,0.8,0.9,0.8,0.8,0.9,0.8,0.9,0.8,0.8,0.8,0.9,0.8,0.7,0.8,0.9,0.8,0.8,0.9,0.8,0.8,0.7,0.7,0.7",
                measurementTimes: "1472688300000,1472688900000,1472689500000,1472690100000,1472690700000,1472691300000,1472691900000,1472692500000,1472693100000,1472693700000,1472694300000,1472694900000,1472695500000,1472696100000,1472697300000,1472697900000,1472698500000,1472699100000,1472699700000,1472700300000,1472700900000,1472701500000,1472702100000,1472702700000,1472703300000,1472703900000,1472704500000,1472705100000,1472705700000,1472706900000,1472707500000,1472708700000,1472709300000,1472709900000,1472710500000,1472711100000,1472711700000,1472712300000,1472712900000,1472714100000,1472714700000,1472715300000,1472716500000,1472717100000,1472717700000,1472718300000,1472718900000,1472719500000,1472720700000,1472721300000,1472722500000,1472723700000,1472724300000,1472724900000,1472725500000,1472726100000,1472726700000,1472727300000,1472727900000,1472728500000,1472729100000,1472729700000,1472730300000,1472730900000,1472732100000,1472733300000,1472733900000,1472735100000,1472735700000,1472736900000,1472737500000,1472738100000,1472738700000,1472739300000,1472739600000,1472739900000,1472740500000,1472741100000,1472741400000,1472741700000,1472742000000,1472742300000,1472742600000,1472743200000,1472743500000,1472743800000,1472744100000,1472744400000,1472744700000,1472745000000,1472745300000,1472745600000,1472745900000,1472746200000,1472746500000,1472746800000,1472747100000,1472747400000,1472747700000,1472748000000,1472748300000,1472748600000,1472748900000,1472749200000,1472749500000,1472749800000,1472750100000,1472750400000,1472750700000,1472751300000,1472751600000,1472752200000,1472752500000,1472752800000,1472753100000,1472753400000,1472753700000,1472754000000,1472754300000,1472754900000,1472755200000,1472755500000,1472755800000,1472756100000,1472756400000,1472756700000,1472757000000,1472757300000,1472757600000,1472757900000,1472758200000,1472758500000,1472758800000,1472759100000,1472759400000,1472759700000,1472760000000,1472760300000,1472760600000,1472760900000,1472761500000,1472762100000,1472762700000,1472763000000,1472763300000,1472763900000,1472764200000,1472764500000,1472764800000,1472765400000,1472766000000,1472766300000,1472766600000,1472766900000"
            });

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);

            const expected = {
                element: {
                    sensorId: "virtual-sensorId-0",
                    source: reading.source,
                    date: "2016-09-01T16:00:00Z",
                    measurements: [{
                        type: "activeEnergy",
                        unitOfMeasurement: "kWh",
                        value: 77.10000000000001
                    }]
                }
            };

            expect(dispatcher).to.have.callCount(1);
            expect(dispatcher).to.have.calledWith("element inserted in collection readings", expected, {});
        });

        it("With aggregates and partial reading, ternary expressions", async () => {

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

            await db.collection(FORMULAS_COLLECTION).insert({
                ...virtualSensor,
                formulas: [{
                    ...formula,
                    measurementUnit: "status",
                    measurementType: "comfort",
                    formula: "(18 <= x and x <= 22) and (y <= 800) and (30 <= z and z <= 50) ? 2 : ((y >= 1000 or x < 16 or x >= 25 or z < 30 or z > 50) ? 0 : 1)",
                    variables: [{
                        symbol: "x",
                        sensorId: reading.sensorId,
                        measurementType: "temperature"
                    }, {
                        symbol: "y",
                        sensorId: reading.sensorId,
                        measurementType: "co2"
                    }, {
                        symbol: "z",
                        sensorId: reading.sensorId,
                        measurementType: "humidity"
                    }]
                }]
            });

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-0-1970-01-01-reading-temperature",
                day: "1970-01-01",
                sensorId: "sensorId-0",
                source: "reading",
                measurementType: "temperature",
                unitOfMeasurement: "°C",
                measurementValues: "21,21,23,22,22,22,22,22,22,22",
                measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
            });

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-0-1970-01-01-reading-co2",
                day: "1970-01-01",
                sensorId: "sensorId-0",
                source: "reading",
                measurementType: "co2",
                unitOfMeasurement: "ppm",
                measurementValues: "400,450,550,800,900,100000,800,900,550,500",
                measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
            });

            await db.collection(AGGREGATES_COLLECTION_NAME).insert({
                _id: "sensorId-0-1970-01-01-reading-humidity",
                day: "1970-01-01",
                sensorId: "sensorId-0",
                source: "reading",
                measurementType: "humidity",
                unitOfMeasurement: "%",
                measurementValues: "30,60,50,45,25,55,35,45,40,35",
                measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
            });

            await handler(event, context);

            expect(context.succeed).to.have.callCount(1);

            const expected = {
                element: {
                    sensorId: "virtual-sensorId-0",
                    source: reading.source,
                    date: "1970-01-01T00:00:00Z",
                    measurements: [{
                        type: "comfort",
                        unitOfMeasurement: "status",
                        value: 0
                    }]
                }
            };

            expect(dispatcher).to.have.callCount(1);
            expect(dispatcher).to.have.calledWith("element inserted in collection readings", expected, {});
        });

    });
});
