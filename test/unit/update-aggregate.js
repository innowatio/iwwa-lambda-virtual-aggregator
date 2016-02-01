import {expect} from "chai";

import updateAggregate from "steps/update-aggregate";

describe("`updateAggregate`", () => {

    const virtualParsedAggregate = {
        _id: "site-2016-01-28-reading-activeEnergy",
        day: "2016-01-28",
        sensorId: "site",
        source: "reading",
        measurementType: "activeEnergy",
        measurementValues: [],
        unitOfMeasurement: "kWh",
        measurementsDeltaInMs: 300000
    };

    const aggregateToCalculate = {
        sensorId: "site",
        date: "2016-01-28T00:02:36.389Z",
        source: "reading",
        measurementType: "activeEnergy",
        formula: "sensor1+sensor2",
        unitOfMeasurement: "kWh",
        measurementValues: {sensor1: "0.808", sensor2: 4}
    };

    it("return the aggregate with the new `measurementValues`", () => {
        const ret = updateAggregate(virtualParsedAggregate, aggregateToCalculate);
        expect(ret).to.deep.equal({
            _id: "site-2016-01-28-reading-activeEnergy",
            day: "2016-01-28",
            sensorId: "site",
            source: "reading",
            measurementType: "activeEnergy",
            measurementValues: [4.808],
            unitOfMeasurement: "kWh",
            measurementsDeltaInMs: 300000
        });
    });

});
