import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://127.0.0.1:8000";

export const fetchBoards = createAsyncThunk("boards/fetch", async (_, thunkAPI) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_URL}/boards`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Ошибка загрузки досок");
    return await res.json();
});

const boardsSlice = createSlice({
    name: "boards",
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBoards.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchBoards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default boardsSlice.reducer;