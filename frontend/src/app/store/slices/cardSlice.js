import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const updateCard = createAsyncThunk(
  "cards/updateCard",
  async ({ sectionId, cardId, title, description }) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(`${API_URL}/cards/${cardId}`, {
      title,
      description,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { sectionId, updatedCard: response.data };
  }
);

export const deleteCard = createAsyncThunk(
  "cards/deleteCard",
  async ({ sectionId, cardId }) => {
    const token = localStorage.getItem("authToken");
    await axios.delete(`${API_URL}/cards/${cardId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { sectionId, cardId };
  }
);

const cardSlice = createSlice({
  name: "cards",
  initialState: {
    bySection: {}, // { sectionId: [cards] }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateCard.fulfilled, (state, action) => {
        const { sectionId, updatedCard } = action.payload;
        const cards = state.bySection[sectionId] || [];
        const index = cards.findIndex((card) => card.id === updatedCard.id);
        if (index !== -1) {
          cards[index] = updatedCard;
        }
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        const { sectionId, cardId } = action.payload;
        const cards = state.bySection[sectionId] || [];
        state.bySection[sectionId] = cards.filter((card) => card.id !== cardId);
      });
  },
});

export default cardSlice.reducer;
