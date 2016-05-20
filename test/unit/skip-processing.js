import {expect} from "chai";

import {getReading} from "../utils";

import skipProcessing from "steps/skip-processing";

describe("skipProcessing", () => {

    it("skips if the source is not a `reading`", () => {
        const notReading = getReading({source: "forecast", type: "activeEnergy"});

        expect(skipProcessing(notReading)).to.be.equals(true);
    });

    it("doesn't skips if the source is a `reading`", () => {
        const reading = getReading({source: "reading", type: "activeEnergy"});

        expect(skipProcessing(reading)).to.be.equals(false);
    });
});
