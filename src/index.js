import "babel-polyfill";
import router from "kinesis-router";
import {SENSOR_INSERT} from "config";

import pipeline from "./pipeline";

export const handler = router()
    .on(SENSOR_INSERT, pipeline);
