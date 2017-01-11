import {expect} from "chai";

import {applyFormula} from "steps/apply-formula";

describe("Compute virtual sensor reading", () => {

    const formula = {
        formula: "x + y",
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

    it("Return correct result with correct aggregates", () => {
        const aggregates = [{
            sensorId: "sensorId-0",
            measurementType: "temperature",
            measurementValues: "5"
        }, {
            sensorId: "sensorId-1",
            measurementType: "co2",
            measurementValues: "10"
        }];

        const result = applyFormula(formula, aggregates);

        expect(result).to.be.deep.equal(15);
    });

    it("Return correct result with correct and fuzzy aggregates", () => {
        const aggregates = [{
            sensorId: "sensorId-0",
            measurementType: "temperature",
            measurementValues: "5"
        }, {
            sensorId: "sensorId-1",
            measurementType: "co2",
            measurementValues: "10"
        }, {
            sensorId: "sensorId-1",
            measurementType: "co2",
            measurementValues: "10"
        }];

        const result = applyFormula(formula, aggregates);

        expect(result).to.be.deep.equal(15);
    });

    it("Return undefined if aggregates are missing", () => {
        const aggregates = [{
            sensorId: "sensorId-0",
            measurementType: "temperature",
            measurementValues: "5"
        }];

        const result = applyFormula(formula, aggregates);

        expect(result).to.be.deep.equal(undefined);
    });

});
