import {expect} from "chai";

import {getReading} from "../mocks";

import {skipProcessing} from "../../src/steps/skip-processing";


describe("skipProcessing", () => {

    it("skips if the source is not a `reading`", () => {
        const notReading = getReading("forecast", "activeEnergy");

        expect(skipProcessing(notReading)).to.be.equals(true);
    });

    it("doesn't skips if the source is a `reading`", () => {
        const reading = getReading({source: "reading", type: "activeEnergy"});

        expect(skipProcessing(reading)).to.be.equals(false);
    });

    it("skips if there are no energy measurements", () => {
        const notReading = getReading({source: "reading", type: "notActive"});

        expect(skipProcessing(notReading)).to.be.equals(true);
    });

    it("doesn't skips if there's an energy measurement", () => {
        const readingMaxPower = getReading({source: "reading", type: "maxPower"});
        const readingActiveEnergy = getReading({source: "reading", type: "activeEnergy"});
        const readingReactiveEnergy = getReading({source: "reading", type: "reactiveEnergy"});

        expect(skipProcessing(readingMaxPower)).to.be.equals(false);
        expect(skipProcessing(readingActiveEnergy)).to.be.equals(false);
        expect(skipProcessing(readingReactiveEnergy)).to.be.equals(false);
    });
});
