import {expect} from "chai";

import {decoupleReading} from "steps/decouple-reading";

describe("Decouple reading", () => {

    const sources = [
        "reading",
        "forecast",
        "reference"
    ];

    sources.forEach(source => {

        it(`source '${source}'`, () => {

            const reading = {
                sensorId: "sensorId-0",
                date: "1970-01-01T00:00:00.000Z",
                source: source,
                measurements: [{
                    type: "activeEnergy",
                    value: 59.5,
                    unitOfMeasurement: "kWh"
                }, {
                    type: "reactiveEnergy",
                    value: 9.5,
                    unitOfMeasurement: "kVARh"
                }, {
                    type: "maxPower",
                    value: 180,
                    unitOfMeasurement: "kW"
                }]
            };

            const result = decoupleReading(reading);
            expect(result).to.be.deep.equal([{
                sensorId: reading.sensorId,
                date: reading.date,
                source: reading.source,
                measurementType: "activeEnergy",
                measurementUnit: "kWh",
                measurementValue: 59.5
            }, {
                sensorId: reading.sensorId,
                date: reading.date,
                source: reading.source,
                measurementType: "reactiveEnergy",
                measurementUnit: "kVARh",
                measurementValue: 9.5
            }, {
                sensorId: reading.sensorId,
                date: reading.date,
                source: reading.source,
                measurementType: "maxPower",
                measurementUnit: "kW",
                measurementValue: 180
            }]);
        });

    });
});
