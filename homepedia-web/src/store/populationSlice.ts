import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface PopulationEntry {
  iso3: string;
  iso2: string;
  name: string;
  region: string;
  incomeLevel: string;
  year: number;
  population: number;
}

interface PopulationState {
  data: PopulationEntry[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PopulationState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchPopulation = createAsyncThunk(
  "population/fetch",
  async () => {
    const res = await fetch("/api/population");
    if (!res.ok) throw new Error("Failed to fetch population data");
    const json = await res.json();
    return json.data as PopulationEntry[];
  },
);

const populationSlice = createSlice({
  name: "population",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopulation.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPopulation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchPopulation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error";
      });
  },
});

export default populationSlice.reducer;
