import chai, {expect} from "chai";
import {spy} from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import {SENSOR_INSERT} from "config";
import {putRecords, __RewireAPI__ as putRecordsRewire} from "steps/put-in-kinesis";

describe("`put-in-kinesis`", () => {

    var mockPutRecords;

    beforeEach(() => {
        mockPutRecords = spy();
        putRecordsRewire.__Rewire__("dispatchEvent", mockPutRecords);
    });

    afterEach(() => {
        putRecordsRewire.__ResetDependency__("dispatchEvent");
    });

    describe("should properly parse a list of aggregated elements", () => {

        it("should call kinesis putRecords with only the valid results", async () => {
            const aggregates = [{
                sensorId: "site1",
                date: "2016-01-28T00:11:00.123",
                source: "reading",
                measurementType: "activeEnergy",
                formula: "sensor1+sensor2",
                unitOfMeasurement: "kWh",
                measurementValues: {
                    sensor1: 0.808,
                    sensor2: 4
                },
                result: undefined
            }, {
                sensorId: "site1",
                date: "2016-01-28T00:11:00.123",
                source: "reading",
                measurementType: "reactiveEnergy",
                formula: "sensor1+sensor2",
                unitOfMeasurement: "kVArh",
                measurementValues: {
                    sensor1: 2,
                    sensor2: 4.444
                },
                result: 6.444
            }];

            const expectedStreamObject = {
                element: {
                    sensorId: "site1",
                    date: "2016-01-28T00:11:00.123",
                    source: "reading",
                    measurements: [{
                        type: "reactiveEnergy",
                        value: 6.444,
                        unitOfMeasurement: "kVArh"
                    }]
                }
            };

            await putRecords(aggregates);
            expect(mockPutRecords.callCount).to.equal(1);
            expect(mockPutRecords).to.have.been.calledWith(
                SENSOR_INSERT,
                expectedStreamObject);
        });

        it("should not call kinesis putRecords if there are no valid results", async () => {
            const aggregates = [{
                sensorId: "site1",
                date: "2016-01-28T00:16:36.389Z",
                source: "reading",
                measurementType: "activeEnergy",
                formula: "sensor1+sensor2",
                unitOfMeasurement: "kWh",
                measurementValues: {
                    sensor1: 0.808,
                    sensor2: 4
                },
                result: undefined
            }, {
                sensorId: "site1",
                date: "2016-01-28T00:16:36.389Z",
                source: "reading",
                measurementType: "reactiveEnergy",
                formula: "sensor1+sensor2",
                unitOfMeasurement: "kVArh",
                measurementValues: {
                    sensor1: 2,
                    sensor2: 4.444
                },
                result: undefined
            }];

            await putRecords(aggregates);
            expect(0).to.equal(mockPutRecords.callCount);
        });
    });

    it("should call kinesis putRecords only the valid results [multiple sensorId]", async () => {
        const aggregates = [{
            sensorId: "site2",
            date: "2016-01-28T00:11:00.000",
            source: "reading",
            measurementType: "activeEnergy",
            formula: "sensor1+sensor2",
            unitOfMeasurement: "kWh",
            measurementValues: {
                sensor1: 0.808,
                sensor2: 4
            },
            result: 4.808
        }, {
            sensorId: "site1",
            date: "2016-01-28T00:11:00.123",
            source: "reading",
            measurementType: "reactiveEnergy",
            formula: "sensor1+sensor2",
            unitOfMeasurement: "kVArh",
            measurementValues: {
                sensor1: 2,
                sensor2: 4.444
            },
            result: 6.444
        }];

        const expectedStreamObject1 = {
            element: {
                sensorId: "site2",
                date: "2016-01-28T00:11:00.000",
                source: "reading",
                measurements: [{
                    type: "activeEnergy",
                    value: 4.808,
                    unitOfMeasurement: "kWh"
                }]
            }
        };
        const expectedStreamObject2 = {
            element: {
                sensorId: "site1",
                date: "2016-01-28T00:11:00.123",
                source: "reading",
                measurements: [{
                    type: "reactiveEnergy",
                    value: 6.444,
                    unitOfMeasurement: "kVArh"
                }]
            }
        };

        await putRecords(aggregates);
        expect(mockPutRecords.callCount).to.equal(2);
        expect(mockPutRecords.args[0][0]).to.deep.equals(SENSOR_INSERT);
        expect(mockPutRecords.args[1][0]).to.deep.equals(SENSOR_INSERT);
        expect(mockPutRecords.args[0][1]).to.deep.equals(expectedStreamObject1);
        expect(mockPutRecords.args[1][1]).to.deep.equals(expectedStreamObject2);
        // doesn't work
        // expect(mockPutRecords).to.have.been.calledWith(
        //     SENSOR_INSERT,
        //     expectedStreamObject1,
        //     SENSOR_INSERT,
        //     expectedStreamObject2);
    });

});
