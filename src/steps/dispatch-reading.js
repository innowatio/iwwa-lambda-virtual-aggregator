import moment from "moment";

import {log} from "../services/logger";
import {dispatch} from "../services/dispatcher";

export async function dispatchReading(reading, formula, result) {

    const {
        date,
        source,
        measurements
    } = reading;
    
    const {
        sensorId,
        measurementType,
        measurementUnit,
        measurementSample
    } = formula;

    const millis = moment.utc(date).valueOf() - moment.utc(date).valueOf() % measurementSample;

    const eventType = "element inserted in collection readings";

    const event = {
        element: {
            sensorId,
            date: moment.utc(millis).format(),
            source: source || measurements[0].source,
            measurements: [{
                type: measurementType,
                value: Math.round(parseFloat(result) * 100) / 100,
                unitOfMeasurement: measurementUnit
            }]
        }
    };

    log.debug({event});

    await dispatch(eventType, event);
}
