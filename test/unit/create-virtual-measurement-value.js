import {expect} from "chai";

import {getSensorWithSourceInMeasurements} from "../utils";
import createVirtualMeasurementValue from "steps/create-virtual-measurement-value";

describe("`createVirtualMeasurementValue`", () => {

    const mockRelatedFormula = [{
        resultId: "site",
        variables: ["sensor1", "sensor2"],
        formulaString: "Sensore1+Sensore2"
    }];
    const event = getSensorWithSourceInMeasurements("2016-01-28T16:40:36.389Z", "reading");

    it("should return an array of the virtual measurement", () => {
        const reading = event.data.element;
        const ret = createVirtualMeasurementValue(reading, mockRelatedFormula);
        console.log(ret);
        expect(ret).to.be.an.instanceOf(Array);
    });

});
