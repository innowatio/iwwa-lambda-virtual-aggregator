import axios from "axios";
import {READINGS_API_ENDPOINT} from "../config";

function createBody (aggregates) {
    return {
        sensorId: aggregates[0].sensorId,
        date: aggregates[0].date,
        source: aggregates[0].source,
        measurements: aggregates.map(agg => {
            return {
                type: agg.type,
                value: agg.result,
                unitOfMeasurement: agg.unitOfMeasurement
            };
        })
    };
}

export default function postSensorEvent (aggregates) {
    axios.post(READINGS_API_ENDPOINT, createBody(aggregates))
        .then((e) => {
            console.log(e);
        })
        .catch((e) => {
            console.log(e);
        });
}
