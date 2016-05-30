import {expect} from "chai";

import resolveFormulas from "steps/resolve-formulas";

describe("resolveFormulas", () => {

    it("should properly resolve the given aggregates", () => {
        const aggregates = [{
            sensorId: "site1",
            date: "2016-01-28T00:23:51.000Z",
            source: "reading",
            measurementType: "activeEnergy",
            formula: "sensor1+sensor2",
            unitOfMeasurement: "kWh",
            measurementValues: {
                sensor1: 0.808, sensor2: 5
            }
        }, {
            sensorId: "site2",
            date: "2016-01-28T00:11:50.000Z",
            source: "reading",
            measurementType: "reactiveEnergy",
            formula: "sensor-11+sensor-22",
            unitOfMeasurement: "kWh",
            measurementValues: {
                "sensor-11": 1, "sensor-22": 5.222
            }
        }];

        const expected = [{
            sensorId: "site1",
            date: "2016-01-28T00:23:51.000Z",
            source: "reading",
            measurementType: "activeEnergy",
            formula: "sensor1+sensor2",
            unitOfMeasurement: "kWh",
            measurementValues: {
                sensor1: 0.808, sensor2: 5
            },
            result: 5.808
        }, {
            sensorId: "site2",
            date: "2016-01-28T00:11:50.000Z",
            source: "reading",
            measurementType: "reactiveEnergy",
            formula: "sensor-11+sensor-22",
            unitOfMeasurement: "kWh",
            measurementValues: {
                "sensor-11": 1, "sensor-22": 5.222
            },
            result: 6.222
        }];

        expect(resolveFormulas(aggregates)).to.deep.equals(expected);
    });
});
