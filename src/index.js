import "babel-polyfill";
import router from "kinesis-router";
import {EVENT_READING_INSERTED} from "config";

import pipeline from "./pipeline";

export const handler = router()
    .on(EVENT_READING_INSERTED, pipeline);
