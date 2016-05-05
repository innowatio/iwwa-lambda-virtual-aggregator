import {expect} from "chai";
import moment from "moment";

import getMeasurementValueFromAggregate from "steps/create-virtual-aggregate/get-measurement-value-from-aggregate";

describe("`getMeasurementValueFromAggregate` function", () => {

    const parsedAggregate1 = {
        _id: "sensor-2016-01-28-reading-activeEnergy",
        sensorId: "sensor",
        day: "2016-01-28",
        source: "reading",
        measurementType: "activeEnergy",
        unitOfMeasurement: "kWh",
        measurementValues: [1, 2, 3, 4, 5, 6, 7, 9, 10],
        measurementTimes: [
            1453939200000,
            1453939260000,
            1453939320000,
            1453939380000,
            1453939440000,
            1453939500000,
            1453939560000,
            1453939620000,
            1453939680000
        ]
    };

    const parsedAggregate2 = {
        _id: "sensor-2016-01-28-reading-reactiveEnergy",
        sensorId: "sensor",
        day: "2016-01-28",
        source: "reading",
        measurementType: "reactiveEnergy",
        unitOfMeasurement: "kVArh",
        measurementValues: [0.1, 0.2, 0.3, 0.4],
        measurementTimes: [
            1453939200000,
            1453939500000,
            1453939800000,
            1453940100000
        ]
    };

    it("return the correct data if it's present in selected range of time", () => {
        const date = "2016-01-28T00:10:00.000Z";
        const sampleDeltaInMS = moment.duration(5, "minutes").asMilliseconds();
        const ret = getMeasurementValueFromAggregate(parsedAggregate2, date, sampleDeltaInMS);
        expect(ret).to.equal(0.3);
    });

    it("return `null` if there isn't at least one values in the specified range", () => {
        const date = "2016-01-28T00:10:00.000Z";
        const sampleDeltaInMS = moment.duration(1, "minutes").asMilliseconds();
        const ret = getMeasurementValueFromAggregate(parsedAggregate1, date, sampleDeltaInMS);
        expect(ret).to.equal(null);
    });

});
