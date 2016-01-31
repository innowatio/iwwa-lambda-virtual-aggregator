import {expect} from "chai";

import mongodb from "services/mongodb";
import * as config from "config";
import {getEventFromObject, run} from "../mocks";
import {getSensorWithSourceInMeasurements, getFormula} from "../utils";
import {handler} from "index";

describe("`iwwa-lambda-virtual-aggregator`", () => {

    var aggregates;
    var formulas;
    var db;

    const aggregateMock = {
        _id: "sensor2-2016-01-28-reading-activeEnergy",
        sensorId: "sensor2",
        day: "2016-01-28",
        source: "reading",
        measurementType: "activeEnergy",
        unitOfMeasurement: "kWh",
        measurementValues: "1,2,3,4,5,6,7,8"
    };

    before(async () => {
        db = await mongodb;
        aggregates = db.collection(config.AGGREGATES_COLLECTION_NAME);
        formulas = db.collection(config.FORMULAS_COLLECTION);
    });
    after(async () => {
        // await db.dropCollection(config.AGGREGATES_COLLECTION_NAME);
        // await db.dropCollection(config.FORMULAS_COLLECTION);
        await db.close();
    });
    beforeEach(async () => {
        await aggregates.remove({});
        await formulas.remove({});
        await aggregates.update({}, aggregateMock, {upsert: true});
        await formulas.update({}, getFormula(), {upsert: true});
    });

    describe("creates a new aggregate for virtual measurement in the reading", () => {

        it("virtual aggregate with `activeEnergy`", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );
            await run(handler, event);
            const count = await aggregates.count({});
            expect(count).to.equal(2);
        });

    });

    describe("correctly builds the virtual aggregate:", () => {

        it("with the `measurementValues` at the right position as sum of `measurementValues` of sensors in `formula`", async () => {
            const event = getEventFromObject(
                getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
            );
            await run(handler, event);
            const aggregate1 = await aggregates.findOne({_id: "site-2016-01-28-reading-activeEnergy"});
            expect(aggregate1).to.deep.equal({
                _id: "site-2016-01-28-reading-activeEnergy",
                sensorId: "site",
                day: "2016-01-28",
                source: "reading",
                measurementType: "activeEnergy",
                unitOfMeasurement: "kWh",
                measurementValues: ",,,4.808",
                measurementsDeltaInMs: 300000
            });
        });

    });

});
