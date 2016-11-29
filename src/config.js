import dotenv from "dotenv";
import moment from "moment";

dotenv.load();

export const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/test";
export const KINESIS_STREAM_NAME = process.env.KINESIS_STREAM_NAME || "test";
export const AGGREGATES_COLLECTION_NAME = process.env.AGGREGATES_COLLECTION_NAME || "readings-daily-aggregates";
export const LOG_LEVEL = process.env.LOG_LEVEL || "info";

export const ALLOWED_SOURCES = ["reading", "forecast"];
export const DEFAULT_SAMPLE_DELTA_IN_MS = moment.duration(5, "minutes").asMilliseconds();
export const FORMULAS_COLLECTION = "virtual-sensors-formulas";
export const PRODUCER = "iwwa-lambda-virtual-aggregator";
export const EVENT_READING_INSERTED = "element inserted in collection readings";
