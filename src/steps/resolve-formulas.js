import {values} from "ramda";

function applyFormula (aggregate) {
    const measurements = values(aggregate.measurementValues);

    return {
        ...aggregate,
        result: measurements.reduce((prev, valueObj) => (prev + valueObj), 0)
    };
}

export default function resolveFormulas (virtualAggregates) {
    // virtualAggregates.map
    return virtualAggregates.map(aggregate => {
        return applyFormula(aggregate);
    });
}
