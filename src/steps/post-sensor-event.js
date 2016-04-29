import axios from "axios";
import {isNil} from "ramda";
import {READINGS_API_ENDPOINT} from "../config";

function createBody (aggregates) {
    return {
        sensorId: aggregates[0].sensorId,
        date: aggregates[0].date,
        source: aggregates[0].source,
        measurements: aggregates.map(agg => {
            if ((!isNaN(agg.result)) && (!isNil(agg.result))) {
                return {
                    type: agg.measurementType,
                    value: agg.result,
                    unitOfMeasurement: agg.unitOfMeasurement
                };
            }
        }).filter(checkNotValid)
    };
}

function checkNotValid (value) {
    return !isNil(value);
}

export default async function postSensorEvent (aggregates) {
    const body = createBody(aggregates);
    if (body.measurements) {
        try {
            await axios.post(READINGS_API_ENDPOINT, body);
        } catch (e) {
            console.log("ERROR POST");
            console.log(e);
        }
    }
}
