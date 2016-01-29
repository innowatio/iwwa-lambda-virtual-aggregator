import {expect} from "chai";

import getValuesFromSensorsInFormula from "steps/get-values-from-sensors-in-formula";
import {getSensorWithSourceInMeasurements} from "../utils";

describe("`getValuesFromSensorsInFormula`", () => {

    const mockRelatedFormula = {
        resultId: "site",
        variables: ["sensor1", "sensor2"],
        formulaString: "Sensore1+Sensore2"
    };
    const source = "reading";
    const date = "2016-01-28T16:40:36.389Z";
    const event = getSensorWithSourceInMeasurements(date, source);
    const virtualAggregate = {
        sensorId: "site",
        date: "2016-01-28T16:40:36.389Z",
        source: source,
        measurementType: "measurementType",
        formula: "sensor1+sensor2",
        measurementValues: [{
            sensorId: "sensor1",
            measurementValue: 4.56
        }]
    };

    it("should return an array of object with `sensorId` and `measurementValue` measurement", () => {
        const reading = event.data.element;
        const sensorId = "sensor1";
        const ret = getValuesFromSensorsInFormula(reading, mockRelatedFormula, virtualAggregate, sensorId);
        console.log(ret);
        expect(ret).to.be.an.instanceOf(Array);
    });

});
