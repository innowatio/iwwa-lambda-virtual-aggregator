import {expect} from "chai";

import {aggregateSensorsAggregates} from "steps/aggregate-aggregates";

describe("Aggregate aggregates", () => {

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

    const aggregates = [{
        _id: "sensorId-0-1970-01-01-reading-temperature",
        day: "1970-01-01",
        sensorId: "sensorId-0",
        source: "reading",
        measurementType: "temperature",
        unitOfMeasurement: "°C",
        measurementValues: "1,2,2,2,2,2,2,2,2,3",
        measurementTimes: "0,500,1000,1500,2000,2500,3000,3500,4000,4500"
    }];

    it("Return correct array with `average` measurement", () => {

        const result = aggregateSensorsAggregates({
            ...formula,
            aggregationType: "average"
        }, aggregates);

        expect(result).to.be.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-temperature",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "temperature",
            unitOfMeasurement: "°C",
            measurementValues: "2",
            measurementTimes: "0"
        }]);

    });

    it("Return correct array with `sum` measurement", () => {

        const result = aggregateSensorsAggregates({
            ...formula,
            aggregationType: "sum"
        }, aggregates);

        expect(result).to.be.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-temperature",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "temperature",
            unitOfMeasurement: "°C",
            measurementValues: "20",
            measurementTimes: "0"
        }]);

    });

    it("Return correct array with `max` measurement", () => {

        const result = aggregateSensorsAggregates({
            ...formula,
            aggregationType: "max"
        }, aggregates);

        expect(result).to.be.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-temperature",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "temperature",
            unitOfMeasurement: "°C",
            measurementValues: "3",
            measurementTimes: "0"
        }]);

    });

    it("Return correct array with `min` measurement", () => {

        const result = aggregateSensorsAggregates({
            ...formula,
            aggregationType: "min"
        }, aggregates);

        expect(result).to.be.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-temperature",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "temperature",
            unitOfMeasurement: "°C",
            measurementValues: "1",
            measurementTimes: "0"
        }]);

    });

    it("Return correct array with `oldest` measurement", () => {

        const result = aggregateSensorsAggregates({
            ...formula,
            aggregationType: "oldest"
        }, aggregates);

        expect(result).to.be.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-temperature",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "temperature",
            unitOfMeasurement: "°C",
            measurementValues: "1",
            measurementTimes: "0"
        }]);

    });

    it("Return correct array with `newest` measurement", () => {

        const result = aggregateSensorsAggregates({
            ...formula,
            aggregationType: "newest"
        }, aggregates);

        expect(result).to.be.deep.equal([{
            _id: "sensorId-0-1970-01-01-reading-temperature",
            day: "1970-01-01",
            sensorId: "sensorId-0",
            source: "reading",
            measurementType: "temperature",
            unitOfMeasurement: "°C",
            measurementValues: "3",
            measurementTimes: "0"
        }]);

    });

});
