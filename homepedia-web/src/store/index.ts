import { configureStore } from "@reduxjs/toolkit";
import populationReducer from "./populationSlice";
import gdpReducer from "./gdpSlice";

export const store = configureStore({
  reducer: {
    population: populationReducer,
    gdp: gdpReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
