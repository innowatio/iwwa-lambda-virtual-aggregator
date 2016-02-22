import axios from "axios";
import {READINGS_API_ENDPOINT} from "../config";

function createBody (aggregates) {
    return {
        sensorId: aggregates[0].sensorId,
        date: aggregates[0].date,
        source: aggregates[0].source,
        measurements: aggregates.map(agg => {
            return {
                type: agg.measurementType,
                value: agg.result,
                unitOfMeasurement: agg.unitOfMeasurement
            };
        })
    };
}

export default async function postSensorEvent (aggregates) {
    try {
        await axios.post(READINGS_API_ENDPOINT, createBody(aggregates));
    } catch (e) {
        console.log(e);
    }
}
