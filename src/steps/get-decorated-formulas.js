export function getDecoratedFormulas(virtualSensors) {
    return virtualSensors.reduce((state, sensor) => {
        return [
            ...state,
            ...sensor.formulas.map(formula => {
                return {
                    ...formula,
                    sensorId: sensor._id
                };
            })
        ];
    }, []);
}
