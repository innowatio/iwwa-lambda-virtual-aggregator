import {expect} from "chai";

import {ALLOWED_SOURCES} from "config";
import {decorateAggregatesWithReading} from "steps/decorate-aggregates-with-reading";

import {
    getReading,
    getReadingWithMultipleMeasurements
} from "../utils";

describe("decorateAggregatesWithReading", () => {

    const sources = ALLOWED_SOURCES;

    sources.forEach(source => {

        it(`add reading with source '${source}'`, () => {

            const reading = getReading({
                source,
                type: "activeEnergy"
            });
            const aggregates = [];

            const result = decorateAggregatesWithReading(aggregates, reading, "2016-01-28", source, {
                measurementType: "activeEnergy"
            });

            expect(result).to.be.deep.equal([{
                _id: `sensor1-2016-01-28-${source}-activeEnergy`,
                day: "2016-01-28",
                sensorId: "sensor1",
                source,
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "0.808",
                measurementTimes: "1453940196389"
            }]);
        });

        it(`append reading with source '${source}'`, () => {

            const reading = getReading({
                source,
                type: "activeEnergy"
            });
            const aggregates = [{
                _id: `sensor1-2016-01-28-${source}-activeEnergy`,
                day: "2016-01-28",
                sensorId: "sensor1",
                source,
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "1",
                measurementTimes: "1453940100000"
            }];

            const result = decorateAggregatesWithReading(aggregates, reading, "2016-01-28", source, {
                measurementType: "activeEnergy"
            });

            expect(result).to.be.deep.equal([{
                _id: `sensor1-2016-01-28-${source}-activeEnergy`,
                day: "2016-01-28",
                sensorId: "sensor1",
                source,
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "1,0.808",
                measurementTimes: "1453940100000,1453940196389"
            }]);
        });

        it(`append a multiple reading with source '${source}'`, () => {

            const reading = getReadingWithMultipleMeasurements();
            const aggregates = [{
                _id: `sensor1-2016-01-28-${source}-activeEnergy`,
                day: "2016-01-28",
                sensorId: "sensor1",
                source,
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "1",
                measurementTimes: "1453940100000"
            }];

            const result = decorateAggregatesWithReading(aggregates, reading, "2016-01-28", source, {
                measurementType: "activeEnergy"
            });

            expect(result).to.be.deep.equal([{
                _id: `sensor1-2016-01-28-${source}-activeEnergy`,
                day: "2016-01-28",
                sensorId: "sensor1",
                source,
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "1,1.1",
                measurementTimes: "1453940100000,1453940196389"
            }]);
        });

        it(`replace a multiple reading with source '${source}'`, () => {

            const reading = getReadingWithMultipleMeasurements();
            const aggregates = [{
                _id: `sensor1-2016-01-28-${source}-activeEnergy`,
                day: "2016-01-28",
                sensorId: "sensor1",
                source,
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "1",
                measurementTimes: "1453940196389"
            }];

            const result = decorateAggregatesWithReading(aggregates, reading, "2016-01-28", source, {
                measurementType: "activeEnergy"
            });

            expect(result).to.be.deep.equal([{
                _id: `sensor1-2016-01-28-${source}-activeEnergy`,
                day: "2016-01-28",
                sensorId: "sensor1",
                source,
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: "1.1",
                measurementTimes: "1453940196389"
            }]);
        });
    });

});
