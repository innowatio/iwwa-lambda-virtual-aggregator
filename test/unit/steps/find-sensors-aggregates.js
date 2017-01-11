import {expect} from "chai";

import {getIds} from "steps/find-sensors-aggregates";

describe("Retrieve aggregate ids", () => {

    it("Return correct array", () => {

        const reading = {
            sensorId: "sensorId-0",
            date: "1970-01-01T00:00:00.000Z",
            source: "reading",
            measurements: [{
                type: "temperature",
                value: 9.5,
                unitOfMeasurement: "°C"
            }]
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
            measurementSample: 60000
        };

        const result = getIds(formula, reading);

        expect(result).to.be.deep.equal([
            "sensorId-1-1970-01-01-reading-co2"
        ]);

    });

});
