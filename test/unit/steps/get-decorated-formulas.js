import {expect} from "chai";

import {getDecoratedFormulas} from "steps/get-decorated-formulas";

describe("Decorate formulas", () => {

    it("Return array with correct decoration", () => {

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

        const virtualSensor = {
            _id: "virtual-sensorId-0",
            sensorsIds: [
                "sensorId-0",
                "sensorId-1"
            ],
            formulas: [formula]
        };

        const result = getDecoratedFormulas([virtualSensor]);

        expect(result).to.be.deep.equal([{
            ...formula,
            sensorId: virtualSensor._id
        }]);

    });
});
