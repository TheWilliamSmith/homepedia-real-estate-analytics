import { configureStore } from "@reduxjs/toolkit";
import populationReducer from "./populationSlice";

export const store = configureStore({
  reducer: {
    population: populationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
