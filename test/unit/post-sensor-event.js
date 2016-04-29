import {expect} from "chai";
import nock from "nock";

import postSensorEvent from "steps/post-sensor-event";

describe("`post-sensor-event`", () => {

    describe("should properly parse a list of aggregated elements", () => {

        it("should POST only the valid results", () => {
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

            const expectedBody = {
                sensorId: "site1",
                date: "2016-01-28T00:11:00.123",
                source: "reading",
                measurements: [{
                    type: "reactiveEnergy",
                    value: 6.444,
                    unitOfMeasurement: "kVArh"
                }]
            };

            var myApi = nock("http://myapi.com")
                .post("/readings", expectedBody)
                .reply(200, {result: "Ok"});
            postSensorEvent(aggregates);
            expect(myApi.isDone()).to.equal(false);
        });

        it("should not POST if there are no valid results", () => {
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

            var myApi = nock("http://myapi.com")
                .post("/readings", {})
                .reply(200, {result: "Ok"});
            postSensorEvent(aggregates);
            expect(myApi.isDone()).to.equal(false);
        });
    });
});
