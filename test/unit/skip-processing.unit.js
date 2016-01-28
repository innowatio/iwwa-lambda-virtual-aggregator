import {expect} from "chai";

import {getReading} from "../mocks";

import {skipProcessing} from "../../src/steps/skip-processing";


describe("skipProcessing", () => {

    it("skips if the source is not a `reading`", () => {
        const notReading = getReading("forecast");

        expect(skipProcessing(notReading)).isTrue;
    });

    it("doesn't skips if the source is a `reading`", () => {
        const reading = getReading("reading");
        expect(skipProcessing(reading)).isFalse;
    });

});
