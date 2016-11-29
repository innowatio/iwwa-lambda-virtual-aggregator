import {map} from "bluebird";
import flattenDeep from "lodash.flattendeep";
import get from "lodash.get";
import moment from "moment";
import {contains} from "ramda";

import log from "../services/logger";

import {findAggregatesForFormula} from "./find-aggregates-for-formula";
import {decorateAggregatesWithReading} from "./decorate-aggregates-with-reading";
import {parseFilterAggregates} from "./parse-filter-aggregates";

export function decoupleFormulas(formulas) {
    const decupledFormulas = formulas.map(formula => {
        return formula.measurementType.map(measurementType => {
            return {
                ...formula,
                measurementType
            };
        });
    });
    return flattenDeep(decupledFormulas);
}

export async function addSensorsDataToFormulas(formulas, reading) {

    const {date} = reading;
    const day = moment.utc(date).format("YYYY-MM-DD");
    const source = get(reading, "measurements.0.source", reading.source);

    const measurementTypes = reading.measurements.map(x => x.type);

    const filteredFormulas = decoupleFormulas(formulas).filter(x => contains(x.measurementType, measurementTypes));

    const decoratedFormulas = await map(filteredFormulas, async (formula) => {

        const aggregates = await findAggregatesForFormula(formula, date, source);
        log.debug({aggregates});

        const aggregatesWithReading = decorateAggregatesWithReading(aggregates, reading, day, source, formula);
        log.debug({aggregatesWithReading});

        const parsedAggregates = parseFilterAggregates(aggregatesWithReading, date, formula.sampleDeltaInMS, formula.aggregationType);
        log.debug({parsedAggregates});

        const formulaWithData = {
            ...formula,
            sensorsData: parsedAggregates
        };

        return formulaWithData;
    });

    log.debug({decoratedFormulas});
    return decoratedFormulas;
}
