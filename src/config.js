import dotenv from "dotenv";
import moment from "moment";

dotenv.load();

export const MONGODB_URL = process.env.MONGODB_URL;
export const KINESIS_STREAM_NAME = process.env.KINESIS_STREAM_NAME;

export const ALLOWED_SOURCES = ["reading"];
export const DEFAULT_SAMPLE_DELTA_IN_MS = moment.duration(5, "minutes").asMilliseconds();
export const FORMULAS_COLLECTION = "virtual-sensors-formulas";
export const AGGREGATES_COLLECTION_NAME = "readings-daily-aggregates";
