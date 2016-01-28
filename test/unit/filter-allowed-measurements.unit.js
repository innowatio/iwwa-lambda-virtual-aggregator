import {expect} from "chai";

import {getReadingWithMultipleMeasurements} from "../mocks";

import {filterAllowedMeasurements} from "../../src/steps/filter-allowed-measurements";


describe("filterAllowedMeasurements", () => {

    it("keeps only the measurements with the allowed energy types", () => {
        const measure = [{
            "type": "activeEnergy",
            "value": "1.1",
            "unitOfMeasurement": "kWh"
        }, {
            "type": "maxPower",
            "value": "3.3",
            "unitOfMeasurement": "kWh"
        }];
        var reading = getReadingWithMultipleMeasurements();

        const result = filterAllowedMeasurements(reading);
        expect(result.measurements.length).to.be.equals(2);
        expect(result.measurements).to.deep.equals(measure);
    });
});
