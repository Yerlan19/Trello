import { configureStore } from "@reduxjs/toolkit";
import boardsReducer from "./slices/boardsSlice";
import boardReducer from "./slices/boardSlice";
import cardsReducer from "./slices/cardSlice"; // добавлено

export const store = configureStore({
  reducer: {
    boards: boardsReducer,
    board: boardReducer,
    cards: cardsReducer, // добавлено
  },
});
