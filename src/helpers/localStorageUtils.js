// Función para guardar el estado en localStorage
export const saveStateToLocalStorage = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('TareajeState', serializedState);
    } catch (err) {
        console.error("No se pudo guardar el estado en localStorage", err);
    }
};

// Función para recuperar el estado desde localStorage
export const loadStateFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('TareajeState');
        if (serializedState === null) return undefined;
        return JSON.parse(serializedState);
    } catch (err) {
        console.error("No se pudo recuperar el estado desde localStorage", err);
        return undefined;
    }
};