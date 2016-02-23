import {expect} from "chai";

import mongodb from "services/mongodb";
import * as config from "config";
import {getEventFromObject, run} from "../mocks";
import {getSensorWithSourceInMeasurements, getFormula} from "../utils";
import {handler} from "index";
import nock from "nock";

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
        nock.cleanAll();
        await aggregates.remove({});
        await formulas.remove({});
        await aggregates.insert(aggregateMockActiveEnergySensor2);
        await formulas.insert(getFormula());
    });

    describe("creates a new aggregate for virtual measurement in the reading", () => {

        it("with `activeEnergy` measurement", async () => {
            const expectedBody = {
                sensorId: "site",
                date: "2016-01-28T00:16:36.389Z",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 4.808,
                    unitOfMeasurement: "kWh"
                }]
            };
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );

            var myApi = nock("http://myapi.com")
                .post("/readings", expectedBody)
                .reply(200, {result: "Ok"});
            await run(handler, event);
            myApi.done();
        });

        it("with `activeEnergy`, `reactiveEnergy` and `maxPower` measurements", async () => {
            const expectedBody = {
                sensorId: "site",
                date: "2016-01-28T00:16:36.389Z",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 4.808,
                    unitOfMeasurement: "kWh"
                }, {
                    type: "reactiveEnergy",
                    value: 0.315,
                    unitOfMeasurement: "kVArh"
                }, {
                    type: "maxPower",
                    value: 0.9,
                    unitOfMeasurement: "VAr"
                }]
            };
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );
            await aggregates.insert(aggregateMockReactiveEnergySensor2);
            await aggregates.insert(aggregateMockMaxPowerSensor2);

            var myApi = nock("http://myapi.com")
                .post("/readings", expectedBody)
                .reply(200, {result: "Ok"});
            await run(handler, event);
            myApi.done();
        });

        it("with 3 `measurementType` and 2 `formulas`", async () => {
            const expectedBody1 = {
                sensorId: "site",
                date: "2016-01-28T00:16:36.389Z",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 4.808,
                    unitOfMeasurement: "kWh"
                }, {
                    type: "reactiveEnergy",
                    value: 0.315,
                    unitOfMeasurement: "kVArh"
                }, {
                    type: "maxPower",
                    value: 0.9,
                    unitOfMeasurement: "VAr"
                }]
            };
            const expectedBody2 = {
                sensorId: "site2",
                date: "2016-01-28T00:16:36.389Z",
                source: "reading",
                measurements: [{
                    type: "reactiveEnergy",
                    value: 7.315,
                    unitOfMeasurement: "kVArh"
                }, {
                    type: "maxPower",
                    value: 3.9,
                    unitOfMeasurement: "VAr"
                }]
            };
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

            var myApi = nock("http://myapi.com")
                .post("/readings", expectedBody1)
                .reply(200, {result: "Ok"})
                .post("/readings", expectedBody2)
                .reply(200, {result: "Ok"});
            await run(handler, event);
            myApi.done();
        });

    });

    describe("correctly builds the virtual aggregate:", () => {

        it("with the `measurementValues` at the right position as sum of `measurementValues` of sensors in `formula`", async () => {
            const expectedBody = {
                sensorId: "site",
                date: "2016-01-28T00:22:36.389Z",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 5.808,
                    unitOfMeasurement: "kWh"
                }]
            };
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:22:36.389Z", "reading")
            );
            await run(handler, event);

            var myApi = nock("http://myapi.com")
                .post("/readings", expectedBody)
                .reply(200, {result: "Ok"});
            await run(handler, event);
            myApi.done();
        });

        it("with the `measurementValues` at the right position as sum of `measurementValues` of sensors in `formula`", async () => {
            const expectedBody = {
                sensorId: "site",
                date: "2016-01-28T00:22:36.389Z",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 0.808,
                    unitOfMeasurement: "kWh"
                }, {
                    type: "reactiveEnergy",
                    value: -0.085,
                    unitOfMeasurement: "kVArh"
                }, {
                    type: "maxPower",
                    value: 0,
                    unitOfMeasurement: "VAr"
                }]
            };

            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:22:36.389Z", "reading")
            );
            await formulas.remove({});
            await formulas.insert({
                resultId: "site",
                variables: ["sensor1"],
                formulaString: "sensor1"
            });

            var myApi = nock("http://myapi.com")
                .post("/readings", expectedBody)
                .reply(200, {result: "Ok"});
            await run(handler, event);
            myApi.done();
        });

        it("with a correct virtual aggregate for every `measurementType`", async () => {
            const expectedBody = {
                sensorId: "site",
                date: "2016-01-28T00:17:00.389Z",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 4.808,
                    unitOfMeasurement: "kWh"
                }, {
                    type: "reactiveEnergy",
                    value: 0.315,
                    unitOfMeasurement: "kVArh"
                }, {
                    type: "maxPower",
                    value: 0.9,
                    unitOfMeasurement: "VAr"
                }]
            };

            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:17:00.389Z", "reading")
            );
            await aggregates.insert(aggregateMockReactiveEnergySensor2);
            await aggregates.insert(aggregateMockMaxPowerSensor2);

            var myApi = nock("http://myapi.com")
                .post("/readings", expectedBody)
                .reply(200, {result: "Ok"});
            await run(handler, event);
            myApi.done();
        });

        it("create a correct post for every and every `resultId` in `formulas`", async () => {
            const expectedBody1 = {
                sensorId: "site",
                date: "2016-01-28T00:16:36.389Z",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 4.808,
                    unitOfMeasurement: "kWh"
                }, {
                    type: "reactiveEnergy",
                    value: 0.315,
                    unitOfMeasurement: "kVArh"
                }, {
                    type: "maxPower",
                    value: 0.9,
                    unitOfMeasurement: "VAr"
                }]
            };
            const expectedBody2 = {
                sensorId: "site2",
                date: "2016-01-28T00:16:36.389Z",
                source: "reading",
                measurements: [{
                    type: "reactiveEnergy",
                    value: 7.315,
                    unitOfMeasurement: "kVArh"
                }, {
                    type: "maxPower",
                    value: 3.9,
                    unitOfMeasurement: "VAr"
                }]
            };
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );
            await aggregates.insert(aggregateMockReactiveEnergySensor2);
            await aggregates.insert(aggregateMockMaxPowerSensor2);
            await aggregates.insert(aggregateMockActiveEnergySensor3);
            await aggregates.insert(aggregateMockReactiveEnergySensor3);
            await aggregates.insert(aggregateMockMaxPowerSensor3);
            await formulas.insert(mockFormulas);

            var myApi = nock("http://myapi.com")
                .post("/readings", expectedBody1)
                .reply(200, {result: "Ok"})
                .post("/readings", expectedBody2)
                .reply(200, {result: "Ok"});
            await run(handler, event);
            myApi.done();
        });

        it("doesn't call API if the event source is `forecast`", async () => {
            var myApi = nock("http://myapi.com")
                .post("/readings", {
                    sensorId: "site",
                    date: "2016-01-28T00:00:11.000Z",
                    source: "reading",
                    measurements: [{
                        type: "activeEnergy",
                        value: 1.808,
                        unitOfMeasurement: "kWh"
                    }]
                })
                .reply(200, {result: "Ok"});

            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:00:11.000Z", "forecast")
            );
            await run(handler, event);
            expect(myApi.isDone()).to.equal(false);

            const event2 = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:00:11.000Z", "reading")
            );
            await run(handler, event2);
            expect(myApi.isDone()).to.equal(true);
        });

        it("non-first day of the month [CASE: 1/2 (only testing different combinations)]", async () => {
            const expectedBody = {
                sensorId: "site",
                date: "2016-01-28T00:00:11.000Z",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 1.808,
                    unitOfMeasurement: "kWh"
                }]
            };

            const myApi = nock("http://myapi.com")
                .post("/readings", expectedBody)
                .reply(200, {result: "Ok"});

            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:00:11.000Z", "reading")
            );
            await run(handler, event);
            myApi.done();
        });

        it("non-first day of the month [CASE: 2/2 (only testing different combinations)]", async () => {
            const expectedBody = {
                sensorId: "site",
                date: "2016-01-28T00:23:51.000Z",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 5.808,
                    unitOfMeasurement: "kWh"
                }]
            };

            const myApi = nock("http://myapi.com")
                .post("/readings", expectedBody)
                .reply(200, {result: "Ok"});

            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:23:51.000Z", "reading")
            );
            await run(handler, event);
            myApi.done();
        });

    });

});
