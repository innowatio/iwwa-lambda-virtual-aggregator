import {expect} from "chai";

import {ALLOWED_SOURCES} from "config";

import {skipReading} from "steps/skip-reading";

describe("Skip reading", () => {

    const reading = {
        sensorId: "sensorId-0",
        date: "1970-01-01T00:00:00.000Z",
        measurements: [{
            type: "activeEnergy",
            value: 59.5,
            unitOfMeasurement: "kWh"
        }, {
            type: "reactiveEnergy",
            value: 9.5,
            unitOfMeasurement: "kVARh"
        }, {
            type: "maxPower",
            value: 180,
            unitOfMeasurement: "kW"
        }]
    };

    it("Return true for allowed source in reading", () => {

        ALLOWED_SOURCES.forEach((source) => {
            const result = skipReading({
                ...reading,
                source
            });
            expect(result).to.be.equal(false);
        });
    });

    it("Return false for disallowed source in reading", () => {
        const result = skipReading({
            ...reading,
            source: "random"
        });
        expect(result).to.be.equal(true);
    });

});
