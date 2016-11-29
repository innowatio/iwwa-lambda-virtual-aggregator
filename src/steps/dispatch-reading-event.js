import {dispatch} from "services/dispatcher";
import log from "services/logger";
import {EVENT_READING_INSERTED} from "config";

export async function dispatchReadingEvent(id, date, source, measurements) {

    const kinesisEvent = {
        element: {
            sensorId: id,
            date,
            source,
            measurements
        }
    };
    log.debug({kinesisEvent});

    await dispatch(EVENT_READING_INSERTED, kinesisEvent);
}
