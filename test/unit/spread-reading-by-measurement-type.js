import {expect} from "chai";

import {getReadingWithMultipleMeasurements} from "../utils";

import spreadReadingByMeasurementType from "steps/spread-reading-by-measurement-type";

describe("filterAllowedMeasurements", () => {

    it("keeps only the measurements with the allowed energy types", () => {
        const measure = [{
            sensorId: "sensor1",
            date: "2016-01-28T00:16:36.389Z",
            measurementType: "activeEnergy",
            measurementValue: "1.1",
            unitOfMeasurement: "kWh",
            source: "reading"
        }, {
            sensorId: "sensor1",
            date: "2016-01-28T00:16:36.389Z",
            measurementType: "maxPower",
            measurementValue: "3.3",
            unitOfMeasurement: "kWh",
            source: "reading"
        }];
        var reading = getReadingWithMultipleMeasurements();
        const result = spreadReadingByMeasurementType(reading);
        expect(result.length).to.be.equals(2);
        expect(result).to.deep.equals(measure);
    });
});
