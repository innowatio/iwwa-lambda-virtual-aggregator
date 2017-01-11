import first from "lodash.first";
import last from "lodash.last";
import max from "lodash.max";
import min from "lodash.min";
import {
    mean,
    sum
} from "ramda";

export function aggregateSensorsAggregates(formula, aggregates) {

    const {
        aggregationType
    } = formula;

    return aggregates.map(aggregate => {

        const measurementTimes = aggregate.measurementTimes.split(",");
        const measurementValues = aggregate.measurementValues.split(",");

        const measurements = measurementTimes.map((time, index) => {
            return {
                time: parseInt(time),
                value: parseFloat(measurementValues[index])
            };
        });

        let measurementTime = "";
        let measurementValue = "";

        if (first(measurements)) {
            measurementTime = first(measurements).time;
            switch (aggregationType) {
                case "max":
                    measurementValue = max(measurements.map(x => x.value));
                    break;
                case "average":
                    measurementValue = mean(measurements.map(x => x.value));
                    break;
                case "newest":
                    measurementValue = last(measurements.map(x => x.value));
                    break;
                case "min":
                    measurementValue = min(measurements.map(x => x.value));
                    break;
                case "sum":
                    measurementValue = sum(measurements.map(x => x.value));
                    break;
                default:
                    measurementValue = first(measurements.map(x => x.value));
                    break;
            }
        }

        return {
            ...aggregate,
            measurementValues: `${measurementValue}`,
            measurementTimes: `${measurementTime}`
        };
    });

}
