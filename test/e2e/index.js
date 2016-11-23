import chai, {expect} from "chai";
import moment from "moment";
import {spy} from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import {ALLOWED_SOURCES, AGGREGATES_COLLECTION_NAME, FORMULAS_COLLECTION, SENSOR_INSERT} from "config";
import {getEventFromObject, run} from "../mocks";
import {getSensorWithSourceInMeasurements, getFormula} from "../utils";
import {handler} from "index";
import stepPutInKinesis from "steps/put-in-kinesis";
import {getMongoClient} from "services/mongodb";

describe("`iwwa-lambda-virtual-aggregator`", () => {

    const sources = ALLOWED_SOURCES;

    sources.forEach(source => {

        describe(`readings with source '${source}'`, () => {

            var mockPutRecords;
            var aggregates;
            var formulas;
            var db;

            const expectCalledOnceWith = (expectedBody) => {
                expect(mockPutRecords.callCount).equals(1);
                expect(mockPutRecords).have.been.calledWith(
                    SENSOR_INSERT,
                    expectedBody
                );
            };

            const aggregateMockActiveEnergySensor2 = {
                _id: `sensor2-2016-01-28-${source}-activeEnergy`,
                sensorId: "sensor2",
                day: "2016-01-28",
                source,
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "1,2,3,4,5,6,7,9,10",
                measurementTimes: "1453939200000,1453939500000,1453939800000,1453940100000,1453940400000,1453940700000,1453941000000, 1453941300000, 1453941600000"
            };

            const aggregateMockReactiveEnergySensor2 = {
                _id: `sensor2-2016-01-28-${source}-reactiveEnergy`,
                sensorId: "sensor2",
                day: "2016-01-28",
                source,
                measurementType: "reactiveEnergy",
                unitOfMeasurement: "kVArh",
                measurementValues: "0.1,0.2,0.3,0.4",
                measurementTimes: "1453939200000,1453939500000,1453939800000,1453940100000"
            };

            const aggregateMockMaxPowerSensor2 = {
                _id: `sensor2-2016-01-28-${source}-maxPower`,
                sensorId: "sensor2",
                day: "2016-01-28",
                source,
                measurementType: "maxPower",
                unitOfMeasurement: "VAr",
                measurementValues: "0.6,0.7,0.8,0.9",
                measurementTimes: "1453939200000,1453939500000,1453939800000,1453940100000"
            };

            const aggregateMockActiveEnergySensor3 = {
                _id: `30-03-2016-01-28-${source}-activeEnergy`,
                sensorId: "30-03",
                day: "2016-01-28",
                source,
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "0.1",
                measurementTimes: "1453939200000"
            };

            const aggregateMockReactiveEnergySensor3 = {
                _id: `30-03-2016-01-28-${source}-reactiveEnergy`,
                sensorId: "30-03",
                day: "2016-01-28",
                source,
                measurementType: "reactiveEnergy",
                unitOfMeasurement: "kVArh",
                measurementValues: "1,5,4,7,3,1,0.1",
                measurementTimes: "1453939200000,1453939500000,1453939800000,1453940100000,1453940400000,1453940700000,1453941000000"
            };

            const aggregateMockMaxPowerSensor3 = {
                _id: `30-03-2016-01-28-${source}-maxPower`,
                sensorId: "30-03",
                day: "2016-01-28",
                source,
                measurementType: "maxPower",
                unitOfMeasurement: "VAr",
                measurementValues: "1,2,1,3,6,5,1",
                measurementTimes: "1453939200000,1453939500000,1453939800000,1453940100000,1453940400000,1453940700000,1453941000000"
            };

            const mockFormulas = {
                _id: "site2",
                variables: ["sensor1", "sensor2", "30-03"],
                measurementType: ["activeEnergy", "temperature", "maxPower", "reactiveEnergy"],
                formulas: [
                    {
                        formula: "sensor1+sensor2+30-03",
                        measurementType: ["activeEnergy", "maxPower", "temperature", "reactiveEnergy"],
                        variables: ["sensor1", "sensor2", "30-03"],
                        sampleDeltaInMS: moment.duration(5, "minutes").asMilliseconds(),
                        start: "1900-01-01T00:00:00.000Z",
                        end: "2100-01-01T00:00:00.000Z"
                    }
                ]
            };

            before(async () => {
                db = await getMongoClient();
                aggregates = db.collection(AGGREGATES_COLLECTION_NAME);
                formulas = db.collection(FORMULAS_COLLECTION);
            });

            after(async () => {
                await db.dropCollection(AGGREGATES_COLLECTION_NAME);
                await db.dropCollection(FORMULAS_COLLECTION);
            });

            beforeEach(async () => {
                mockPutRecords = spy();
                stepPutInKinesis.__Rewire__("dispatchEvent", mockPutRecords);

                await aggregates.remove({});
                await formulas.remove({});
                await aggregates.insert(aggregateMockActiveEnergySensor2);
                await formulas.insert(getFormula());
            });

            afterEach(() => {
                stepPutInKinesis.__Rewire__("dispatchEvent", mockPutRecords);
            });

            describe("creates a new aggregate for virtual measurement in the reading", () => {

                it("with `activeEnergy` measurement", async () => {
                    const expectedBody = {
                        element: {
                            sensorId: "site",
                            date: "2016-01-28T00:15:00.000Z",
                            source,
                            measurements: [{
                                type: "activeEnergy",
                                value: 4.808,
                                unitOfMeasurement: "kWh"
                            }]
                        }
                    };
                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", source)
                    );

                    await run(handler, event);
                    expect(mockPutRecords).have.been.calledWith(
                        SENSOR_INSERT,
                        expectedBody
                    );
                });

                it("with `activeEnergy`, `reactiveEnergy` and `maxPower` measurements", async () => {
                    const expectedBody = {
                        element: {
                            sensorId: "site",
                            date: "2016-01-28T00:15:00.000Z",
                            source,
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
                        }
                    };
                    const formula = {
                        variables: ["sensor1", "sensor2"],
                        measurementType: [
                            "activeEnergy",
                            "temperature",
                            "maxPower"
                        ],
                        formulas: [
                            {
                                formula: "sensor1+sensor2",
                                measurementType: ["activeEnergy", "maxPower", "reactiveEnergy"],
                                variables: ["sensor1", "sensor2"],
                                sampleDeltaInMS: moment.duration(5, "minutes").asMilliseconds(),
                                start: "1900-01-01T00:00:00.000Z",
                                end: "2100-01-01T00:00:00.000Z"
                            },
                            {
                                formula: "sensor1+sensor2",
                                measurementType: ["temperature"],
                                variables: ["sensor1", "sensor2"],
                                sampleDeltaInMS: moment.duration(5, "minutes").asMilliseconds(),
                                start: "1900-01-01T00:00:00.000Z",
                                end: "2100-01-01T00:00:00.000Z"
                            }
                        ]
                    };
                    formulas.update({_id: "site"}, formula);
                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:18:36.389Z", source)
                    );
                    await aggregates.insert(aggregateMockReactiveEnergySensor2);
                    await aggregates.insert(aggregateMockMaxPowerSensor2);

                    await run(handler, event);
                    expectCalledOnceWith(expectedBody);
                });

                it("with 3 `measurementType` and 2 `formulas`", async () => {
                    const expectedBody1 = {
                        element: {
                            sensorId: "site",
                            date: "2016-01-28T00:05:00.000Z",
                            source,
                            measurements: [{
                                type: "activeEnergy",
                                value: 2.808,
                                unitOfMeasurement: "kWh"
                            }, {
                                type: "maxPower",
                                value: 0.7,
                                unitOfMeasurement: "VAr"
                            }]
                        }
                    };
                    const expectedBody2 = {
                        element: {
                            sensorId: "site2",
                            date: "2016-01-28T00:05:00.000Z",
                            source,
                            measurements: [{
                                type: "reactiveEnergy",
                                value: 5.115,
                                unitOfMeasurement: "kVArh"
                            }, {
                                type: "maxPower",
                                value: 2.7,
                                unitOfMeasurement: "VAr"
                            }]
                        }
                    };
                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:08:36.389Z", source)
                    );
                    await aggregates.insert(aggregateMockReactiveEnergySensor2);
                    await aggregates.insert(aggregateMockMaxPowerSensor2);
                    await aggregates.insert(aggregateMockActiveEnergySensor3);
                    await aggregates.insert(aggregateMockReactiveEnergySensor3);
                    await aggregates.insert(aggregateMockMaxPowerSensor3);
                    await formulas.insert(mockFormulas);

                    await run(handler, event);
                    expect(mockPutRecords.callCount).to.equal(2);
                    expect(mockPutRecords.args[0][0]).to.deep.equals(SENSOR_INSERT);
                    expect(mockPutRecords.args[1][0]).to.deep.equals(SENSOR_INSERT);
                    expect(mockPutRecords.args[0][1]).to.deep.equals(expectedBody1);
                    expect(mockPutRecords.args[1][1]).to.deep.equals(expectedBody2);
                });

            });

            describe("correctly builds the virtual aggregate:", () => {

                it("with the `measurementValues` at the right position as sum of `measurementValues` of sensors in `formula`", async () => {
                    const expectedBody = {
                        element: {
                            sensorId: "site",
                            date: "2016-01-28T00:20:00.000Z",
                            source,
                            measurements: [{
                                type: "activeEnergy",
                                value: 5.808,
                                unitOfMeasurement: "kWh"
                            }]
                        }
                    };
                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:22:36.389Z", source)
                    );

                    await run(handler, event);
                    expectCalledOnceWith(expectedBody);
                });

                it("with the `measurementValues` at the right position as sum of `measurementValues` of sensors in `formula`", async () => {
                    const expectedBody = {
                        element: {
                            sensorId: "site",
                            date: "2016-01-28T00:20:00.000Z",
                            source,
                            measurements: [{
                                type: "activeEnergy",
                                value: 3.603,
                                unitOfMeasurement: "kWh"
                            }]
                        }
                    };

                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:22:36.389Z", source)
                    );
                    await formulas.remove({});
                    await formulas.insert({
                        _id: "site",
                        variables: ["sensor1"],
                        measurementType: [
                            "activeEnergy",
                            "temperature",
                            "maxPower"
                        ],
                        formulas: [
                            {
                                formula: "sensor1",
                                variables: ["sensor1"],
                                aggregationType: "mean",
                                measurementType: ["activeEnergy", "maxPower", "temperature"],
                                sampleDeltaInMS: moment.duration(5, "minutes").asMilliseconds(),
                                start: "1900-01-01T00:00:00.000Z",
                                end: "2100-01-01T00:00:00.000Z"
                            }
                        ]
                    });
                    await aggregates.insert({
                        _id: `sensor1-2016-01-28-${source}-activeEnergy`,
                        sensorId: "sensor1",
                        day: "2016-01-28",
                        source: source,
                        measurementType: "activeEnergy",
                        unitOfMeasurement: "kWh",
                        measurementValues: "1,2,3,4,0,10,4500,6,7,9,10",
                        measurementTimes: "1453939200000,1453939500000,1453939800000,1453940100000,1453940400000,1453940400500,1453940556389,1453940700000,1453941000000, 1453941300000, 1453941600000"
                    });

                    await run(handler, event);
                    expectCalledOnceWith(expectedBody);
                });

                it("with a correct virtual aggregate for every `measurementType`", async () => {
                    const expectedBody = {
                        element: {
                            sensorId: "site",
                            date: "2016-01-28T00:15:00.000Z",
                            source,
                            measurements: [{
                                type: "activeEnergy",
                                value: 4.808,
                                unitOfMeasurement: "kWh"
                            }, {
                                type: "maxPower",
                                value: 0.9,
                                unitOfMeasurement: "VAr"
                            }]
                        }
                    };

                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:17:00.389Z", source)
                    );
                    await aggregates.insert(aggregateMockReactiveEnergySensor2);
                    await aggregates.insert(aggregateMockMaxPowerSensor2);

                    await run(handler, event);
                    expectCalledOnceWith(expectedBody);
                });

                it("calls kinesis putRecords with the correct data", async () => {
                    const expectedBody1 = {
                        element: {
                            sensorId: "site",
                            date: "2016-01-28T00:15:00.000Z",
                            source,
                            measurements: [{
                                type: "activeEnergy",
                                value: 4.808,
                                unitOfMeasurement: "kWh"
                            }, {
                                type: "maxPower",
                                value: 0.9,
                                unitOfMeasurement: "VAr"
                            }]
                        }
                    };
                    const expectedBody2 = {
                        element: {
                            sensorId: "site2",
                            date: "2016-01-28T00:15:00.000Z",
                            source,
                            measurements: [{
                                type: "reactiveEnergy",
                                value: 7.315,
                                unitOfMeasurement: "kVArh"
                            }, {
                                type: "maxPower",
                                value: 3.9,
                                unitOfMeasurement: "VAr"
                            }]
                        }
                    };
                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", source)
                    );
                    await aggregates.insert(aggregateMockReactiveEnergySensor2);
                    await aggregates.insert(aggregateMockMaxPowerSensor2);
                    await aggregates.insert(aggregateMockActiveEnergySensor3);
                    await aggregates.insert(aggregateMockReactiveEnergySensor3);
                    await aggregates.insert(aggregateMockMaxPowerSensor3);
                    await formulas.insert(mockFormulas);

                    await run(handler, event);
                    expect(mockPutRecords.callCount).to.equal(2);
                    expect(mockPutRecords.args[0][0]).to.deep.equals(SENSOR_INSERT);
                    expect(mockPutRecords.args[1][0]).to.deep.equals(SENSOR_INSERT);
                    expect(mockPutRecords.args[0][1]).to.deep.equals(expectedBody1);
                    expect(mockPutRecords.args[1][1]).to.deep.equals(expectedBody2);
                });

                it("calls kinesis putRecords for virtual aggregates with custom `sampleDeltaInMS`", async () => {
                    const expectedBody = {
                        element: {
                            sensorId: "site2",
                            date: "2016-01-28T00:04:00.000Z",
                            source,
                            measurements: [{
                                type: "activeEnergy",
                                value: 2.808,
                                unitOfMeasurement: "kWh"
                            }, {
                                type: "reactiveEnergy",
                                value: 0.115,
                                unitOfMeasurement: "kVArh"
                            }, {
                                type: "maxPower",
                                value: 0.7,
                                unitOfMeasurement: "VAr"
                            }]
                        }
                    };

                    const mockFormulasWithSampleDelta = {
                        _id: "site2",
                        variables: ["sensor1", "sensor2", "30-03"],
                        measurementType: [
                            "activeEnergy",
                            "temperature",
                            "maxPower",
                            "reactiveEnergy"
                        ],
                        formulas: [
                            {
                                formula: "sensor1+sensor2+30-03",
                                measurementType: ["activeEnergy", "maxPower", "temperature", "reactiveEnergy"],
                                variables: ["sensor1", "sensor2", "30-03"],
                                sampleDeltaInMS: moment.duration(5, "minutes").asMilliseconds(),
                                start: "1900-01-01T00:00:00.000Z",
                                end: "2016-01-01T00:00:00.000Z"
                            }, {
                                formula: "sensor1+sensor2",
                                measurementType: ["activeEnergy", "maxPower", "temperature", "reactiveEnergy"],
                                variables: ["sensor1", "sensor2"],
                                sampleDeltaInMS: moment.duration(2, "minutes").asMilliseconds(),
                                start: "2016-01-01T00:00:00.000Z",
                                end: "2100-01-01T00:00:00.000Z"
                            }
                        ]
                    };

                    await formulas.remove({});
                    await formulas.insert(mockFormulasWithSampleDelta);
                    await aggregates.insert(aggregateMockReactiveEnergySensor2);
                    await aggregates.insert(aggregateMockMaxPowerSensor2);

                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:05:11.000Z", source)
                    );
                    await run(handler, event);
                    expectCalledOnceWith(expectedBody);
                });

                it("testing different combinations [CASE: 1/2]", async () => {
                    const expectedBody = {
                        element: {
                            sensorId: "site",
                            date: "2016-01-28T00:00:00.000Z",
                            source,
                            measurements: [{
                                type: "activeEnergy",
                                value: 1.808,
                                unitOfMeasurement: "kWh"
                            }]
                        }
                    };

                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:00:11.000Z", source)
                    );
                    await run(handler, event);
                    expectCalledOnceWith(expectedBody);
                });

                it("testing different combinations [CASE: 2/2]", async () => {
                    const expectedBody = {
                        element: {
                            sensorId: "site",
                            date: "2016-01-28T00:35:00.000Z",
                            source,
                            measurements: [{
                                type: "activeEnergy",
                                value: 9.808,
                                unitOfMeasurement: "kWh"
                            }]
                        }
                    };

                    const event = getEventFromObject(
                        getSensorWithSourceInMeasurements("2016-01-28T00:37:51.000Z", source)
                    );
                    await run(handler, event);
                    expectCalledOnceWith(expectedBody);
                });

            });

        });

    });



});
