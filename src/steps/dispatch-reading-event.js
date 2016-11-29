import {dispatch} from "services/dispatcher";
import {EVENT_READING_INSERTED} from "config";

export async function dispatchReadingEvent(id, date, source, measurements) {
    await dispatch(EVENT_READING_INSERTED, {
        element: {
            sensorId: id,
            date,
            source,
            measurements
        }
    });
}
