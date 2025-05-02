import { configureStore } from "@reduxjs/toolkit";
import boardsReducer from "./slices/boardsSlice";
import boardReducer from "./slices/boardSlice";

export const store = configureStore({
    reducer: {
        boards: boardsReducer,
        board: boardReducer,
    },
});