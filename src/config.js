import dotenv from "dotenv";
import moment from "moment";

dotenv.load();

export const MONGODB_URL = process.env.MONGODB_URL;
export const ALLOWED_SOURCES = ["reading"];
export const ALLOWED_ENERGY_TYPES = ["activeEnergy", "reactiveEnergy", "maxPower"];
export const DEFAULT_SAMPLE_DELTA_IN_MS = moment.duration(5, "minutes").asMilliseconds();
export const FORMULAS_COLLECTION = "virtual_sensors_formulas";
export const AGGREGATES_COLLECTION_NAME = "readings-daily-aggregates";
export const READINGS_API_ENDPOINT = process.env.READINGS_API_ENDPOINT || "http://myapi.com/readings";
