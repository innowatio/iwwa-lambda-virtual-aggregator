import {expect} from "chai";

import {ALLOWED_SOURCES} from "config";
import {skipProcessing} from "steps/skip-processing";

import {getReading} from "../utils";

describe("skipProcessing", () => {

    const sources = ALLOWED_SOURCES;

    sources.forEach(source => {
        it(`doesn't skips if the source is a '${source}'`, () => {
            const reading = getReading({
                source,
                type: "activeEnergy"
            });
            expect(skipProcessing(reading)).to.be.equals(false);
        });
    });

    const randomSources = [
        "computed",
        "data-science"
    ];

    randomSources.forEach(source => {
        it(`skips if the source is not allowed ('${source}')`, () => {
            const reading = getReading({
                source,
                type: "activeEnergy"
            });
            expect(skipProcessing(reading)).to.be.equals(true);
        });
    });

});
