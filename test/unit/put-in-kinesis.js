import chai, {expect} from "chai";
import {spy} from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import {putRecords, __RewireAPI__ as putRecordsRewire} from "steps/put-in-kinesis";

describe("`put-in-kinesis`", () => {

    var mockPutRecords;

    beforeEach(() => {
        mockPutRecords = spy();
        putRecordsRewire.__Rewire__("kinesis", {
            putRecords: mockPutRecords
        });
    });

    afterEach(() => {
        putRecordsRewire.__ResetDependency__("kinesis");
    });

    describe("should properly parse a list of aggregated elements", () => {

        it("should POST only the valid results", async () => {
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
                Records: [{
                    Data: JSON.stringify({
                        sensorId: "site1",
                        date: "2016-01-28T00:11:00.123",
                        source: "reading",
                        measurements: [{
                            type: "reactiveEnergy",
                            value: 6.444,
                            unitOfMeasurement: "kVArh"
                        }]
                    }),
                    PartitionKey: "site1"
                }],
                StreamName: "test"
            };

            await putRecords(aggregates);
            expect(mockPutRecords.callCount).to.equal(1);
            expect(mockPutRecords).to.have.been.calledWith(expectedStreamObject);
        });

        it("should not POST if there are no valid results", async () => {
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
                result: "test"
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
                result: "test"
            }];

            await putRecords(aggregates);
            expect(mockPutRecords.callCount).to.equal(0);
        });
    });

    it("should POST only the valid results [multiple sensorId]", async () => {
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

        const expectedStreamObject = [{
            Records: [{
                Data: JSON.stringify({
                    sensorId: "site2",
                    date: "2016-01-28T00:11:00.000",
                    source: "reading",
                    measurements: [{
                        type: "activeEnergy",
                        value: 4.808,
                        unitOfMeasurement: "kWh"
                    }]
                }),
                PartitionKey: "site2"
            }],
            StreamName: "test"
        }, {
            Records: [{
                Data: JSON.stringify({
                    sensorId: "site1",
                    date: "2016-01-28T00:11:00.123",
                    source: "reading",
                    measurements: [{
                        type: "reactiveEnergy",
                        value: 6.444,
                        unitOfMeasurement: "kVArh"
                    }]
                }),
                PartitionKey: "site1"
            }],
            StreamName: "test"
        }];

        await putRecords(aggregates);
        expect(mockPutRecords.callCount).to.equal(2);
        expect(mockPutRecords.args[0][0]).to.deep.equals(expectedStreamObject[0]);
        expect(mockPutRecords.args[1][0]).to.deep.equals(expectedStreamObject[1]);

        // TODO capire perchè non va con tutto expectedStreamObject
        expect(mockPutRecords).to.have.been.calledWith(expectedStreamObject[0]);
    });

});
