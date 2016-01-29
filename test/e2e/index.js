// import {expect} from "chai";

import mongodb from "services/mongodb";
import * as config from "services/config";
import {getEventFromObject, run} from "../mocks";
import {getSensorWithSourceInMeasurements, getFormula} from "../utils";
import {handler} from "index";

describe("`iwwa-lambda-virtual-aggregator`", async () => {

    var aggregates;
    var formulas;
    var db;

    const aggregateMock = {
        _id: "sensor1-2016-01-28-reading-activeEnergy",
        sensorId: "sensor2",
        day: "2016-01-28",
        source: "reading",
        measurementType: "activeEnergy",
        unitOfMeasurement: "kWh",
        measurementValues: "1,2,3,4"
    };

    before(async () => {
        db = await mongodb;
        aggregates = db.collection(config.AGGREGATES_COLLECTION_NAME);
        aggregates.update({}, aggregateMock, {upsert: true});
        formulas = db.collection(config.FORMULAS_COLLECTION);
        formulas.update({}, getFormula(), {upsert: true});
    });
    after(async () => {
        await db.dropCollection(config.AGGREGATES_COLLECTION_NAME);
        await db.dropCollection(config.FORMULAS_COLLECTION);
        await db.close();
    });
    beforeEach(async () => {
        await aggregates.remove({});
        await formulas.remove({});
    });

    it("should return an array of the virtual measurement", async () => {
        const event = getEventFromObject(
            getSensorWithSourceInMeasurements("2016-01-28T00:16:36.389Z", "reading")
        );
        await run(handler, event);
        // expect(ret).to.be.an.instanceOf(Promise);
    });

});
