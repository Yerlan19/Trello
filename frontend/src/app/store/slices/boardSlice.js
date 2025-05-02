import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://127.0.0.1:8000";

export const fetchBoardById = createAsyncThunk("board/fetchById", async (id, thunkAPI) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_URL}/boards/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Ошибка загрузки доски");
    return await res.json();
});

const boardSlice = createSlice({
    name: "board",
    initialState: {
        data: null,
        loading: false,
        error: null,
    },
    reducers: {
        setBoard(state, action) {
            state.data = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoardById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBoardById.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchBoardById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { setBoard } = boardSlice.actions;
export default boardSlice.reducer;