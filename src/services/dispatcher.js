import {Kinesis} from "aws-sdk";
import getDispatch from "lk-dispatch";

import {
    KINESIS_STREAM_NAME,
    KINESIS_PRODUCER_ID
} from "config";

var dispatcherInstance;

export function setInstance(instance) {
    dispatcherInstance = instance;
    return dispatcherInstance;
}

function getInstance () {
    if (!dispatcherInstance) {
        dispatcherInstance = getDispatch({
            kinesisClient: new Kinesis({
                apiVersion: "2013-12-02"
            }),
            kinesisStream: KINESIS_STREAM_NAME,
            producerId: KINESIS_PRODUCER_ID
        });
    }
    return dispatcherInstance;
}

export async function dispatch(eventType, eventData, eventOptions = {}) {
    const dispatch = getInstance();
    await dispatch(eventType, eventData, eventOptions);
}
