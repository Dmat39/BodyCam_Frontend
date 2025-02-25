// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';

// Importa los reducers que crearás más adelante
import { loadStateFromLocalStorage, saveStateToLocalStorage } from '../../helpers/localStorageUtils';
import AuthSlice from '../Slices/AuthSlice';


const preloadedState = loadStateFromLocalStorage();

// Configura el store con los reducers importados
export const store = configureStore({
    reducer: {
        auth: AuthSlice,
    },
    preloadedState
});

store.subscribe(() => {
    saveStateToLocalStorage(store.getState());
});


export default store;