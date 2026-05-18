import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface GdpEntry {
  iso3: string;
  iso2: string;
  name: string;
  region: string;
  incomeLevel: string;
  year: number;
  gdpPerCapita: number;
}

interface GdpState {
  data: GdpEntry[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: GdpState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchGdp = createAsyncThunk("gdp/fetch", async () => {
  const res = await fetch("/api/gdp");
  if (!res.ok) throw new Error("Failed to fetch GDP data");
  const json = await res.json();
  return json.data as GdpEntry[];
});

const gdpSlice = createSlice({
  name: "gdp",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGdp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchGdp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchGdp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error";
      });
  },
});

export default gdpSlice.reducer;
