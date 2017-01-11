import {expect} from "chai";
import sinon from "sinon";

import {filterSensorsAggregates} from "steps/filter-sensors-aggregates";

describe("Filter aggregates", () => {

    let clock = sinon.useFakeTimers();

    after(() => {
        clock.restore();
    });

    it("Return correct array", () => {

        const reading = {
            sensorId: "sensorId-0",
            date: "1970-01-01T00:00:00.000Z",
            source: "reading",
            measurements: [{
                type: "temperature",
                value: 9.5,
                unitOfMeasurement: "°C"
            }]
        };

        const formula = {
            formula: "x/y",
            variables: [{
                symbol: "x",
                sensorId: "sensorId-0",
                measurementType: "temperature"
            }, {
                symbol: "y",
                sensorId: "sensorId-1",
                measurementType: "co2"
            }],
            start: "1970-01-01T00:00:00.000Z",
            end: "1970-01-02T00:00:00.000Z",
            measurementType: "customType",
            measurementUnit: "°C/ppm",
            measurementSample: 60000
        };

        let measurements = [];
        for (var index = 0; index < 500; index++) {
            measurements[index] = {
                time: index * 5000,
                value: index
            };
        }

        const aggregates = [{
            _id: "sensorId-0-1970-01-01-reading-temperature",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "temperature",
            unitOfMeasurement: "°C",
            measurementValues: measurements.map(x => x.value).join(","),
            measurementTimes: measurements.map(x => x.time).join(",")
        }];

        const result = filterSensorsAggregates(reading, formula, aggregates);

        expect(result).to.be.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-temperature",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "temperature",
            unitOfMeasurement: "°C",
            measurementValues: "0,1,2,3,4,5,6,7,8,9,10,11,12",
            measurementTimes: "0,5000,10000,15000,20000,25000,30000,35000,40000,45000,50000,55000,60000"
        }]);

    });

});
