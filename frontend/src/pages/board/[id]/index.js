import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../../components/header";
import { FaPlus, FaTimes } from "react-icons/fa";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Section } from "./Section";
import { useSelector, useDispatch } from "react-redux";
import { fetchBoardById, setBoard } from "../../../app/store/slices/boardSlice";
import "./board-page.css";
import { updateCard, deleteCard } from "../../../app/store/slices/cardSlice";

const API_URL = "http://127.0.0.1:8000";

const BoardPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const dispatch = useDispatch();
  const board = useSelector((state) => state.board.data);

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newCards, setNewCards] = useState({});
  const [addingCard, setAddingCard] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  const handleEditCard = (sectionId, cardId, title, description) => {
    dispatch(updateCard({ sectionId, cardId, title, description }));
  };

  const handleDeleteCard = (sectionId, cardId) => {
    dispatch(deleteCard({ sectionId, cardId }));
  };

  useEffect(() => {
    if (id) dispatch(fetchBoardById(id));
  }, [dispatch, id]);

  const updateBoardState = (newBoard) => dispatch(setBoard(newBoard));

  const handleToggleNewSection = useCallback(() => {
    setIsAddingSection((prev) => !prev);
    setNewSectionTitle("");
  }, []);

  const handleCreateSection = useCallback(async () => {
    if (!newSectionTitle.trim()) return;
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return router.push("/login-page");

      const res = await fetch(`${API_URL}/sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({ boardId: id, title: newSectionTitle }),
      });
      const newSection = await res.json();
      updateBoardState({
        ...board,
        sections: [...board.sections, newSection],
      });
      setNewSectionTitle("");
      setIsAddingSection(false);
    } catch (err) {
      console.error(err);
    }
  }, [newSectionTitle, board, id, router]);

  const handleToggleAddCard = useCallback((sectionId) => {
    setAddingCard((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
    setNewCards((prev) => ({
      ...prev,
      [sectionId]: { title: "" },
    }));
  }, []);

  const handleCreateCard = useCallback(async (sectionId) => {
    const cardData = newCards[sectionId] || { title: "" };
    if (!cardData.title.trim()) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return router.push("/login-page");

      const res = await fetch(
        `${API_URL}/cards?sectionId=${sectionId}&title=${encodeURIComponent(cardData.title)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newCard = await res.json();

      updateBoardState({
        ...board,
        sections: board.sections.map((sec) =>
          sec.id === sectionId
            ? { ...sec, cards: [...(sec.cards || []), newCard] }
            : sec
        ),
      });

      setNewCards((prev) => ({ ...prev, [sectionId]: { title: "" } }));
      setAddingCard((prev) => ({ ...prev, [sectionId]: false }));
    } catch (err) {
      console.error(err);
    }
  }, [newCards, board, router]);

  const handleDeleteSection = useCallback(async (sectionId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return router.push("/login-page");

      await fetch(`${API_URL}/sections/${sectionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      updateBoardState({
        ...board,
        sections: board.sections.filter((s) => s.id !== sectionId),
      });
    } catch (err) {
      console.error(err);
    }
  }, [board, router]);

  const updateSection = useCallback(async (sectionId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return router.push("/login-page");

      const res = await fetch(
        `${API_URL}/sections/${sectionId}?newTitle=${encodeURIComponent(editedTitle)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedSection = await res.json();

      updateBoardState({
        ...board,
        sections: board.sections.map((s) =>
          s.id === sectionId ? updatedSection : s
        ),
      });

      setEditingSection(null);
      setEditedTitle("");
      setMenuOpen(null);
    } catch (err) {
      console.error(err);
    }
  }, [editedTitle, board, router]);

  const handleDragEnd = useCallback(async (result) => {
    const { destination, source, type, draggableId } = result;
    if (!destination) return;

    const token = localStorage.getItem("authToken");
    if (!token) return router.push("/login-page");

    if (type === "COLUMN") {
      const newSections = Array.from(board.sections);
      const [movedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, movedSection);

      updateBoardState({ ...board, sections: newSections });

      await fetch(
        `${API_URL}/sections/${draggableId}/move?position=${destination.index}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    if (type === "CARD") {
      const sourceSection = board.sections.find(
        (sec) => sec.id.toString() === source.droppableId
      );
      const destSection = board.sections.find(
        (sec) => sec.id.toString() === destination.droppableId
      );
      if (!sourceSection || !destSection) return;

      const sourceCards = Array.from(sourceSection.cards);
      const [movedCard] = sourceCards.splice(source.index, 1);

      if (sourceSection.id === destSection.id) {
        sourceCards.splice(destination.index, 0, movedCard);
      }

      const destCards =
        sourceSection.id === destSection.id
          ? sourceCards
          : [...(destSection.cards || []), movedCard];

      const updatedSections = board.sections.map((sec) => {
        if (sec.id === sourceSection.id) return { ...sec, cards: sourceCards };
        if (sec.id === destSection.id) return { ...sec, cards: destCards };
        return sec;
      });

      updateBoardState({ ...board, sections: updatedSections });

      await fetch(
        `${API_URL}/cards/${draggableId}/move?sectionId=${destination.droppableId}&position=${destination.index}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  }, [board, router]);

  return (
    <>
      <Header />
      <div className="board-page">
        <h1>{board?.title || "Без названия"}</h1>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div
                className="sections"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {board?.sections?.map((section, index) => (
                  <Section
                    key={section.id}
                    section={section}
                    index={index}
                    editingSection={editingSection}
                    editedTitle={editedTitle}
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                    onEditTitleChange={(e) => setEditedTitle(e.target.value)}
                    onEditStart={(id, title) => {
                      setEditingSection(id);
                      setEditedTitle(title);
                    }}
                    onEditCancel={() => setEditingSection(null)}
                    onEditConfirm={updateSection}
                    onDelete={handleDeleteSection}
                    onToggleAddCard={handleToggleAddCard}
                    onCardTitleChange={(sectionId, title) =>
                      setNewCards((prev) => ({
                        ...prev,
                        [sectionId]: { ...prev[sectionId], title },
                      }))
                    }
                    onCreateCard={handleCreateCard}
                    onEditCard={handleEditCard}        // ✅ добавлено
                    onDeleteCard={handleDeleteCard}    // ✅ добавлено
                    addingCard={addingCard}
                    newCards={newCards}
                  />
                ))}

                {provided.placeholder}

                <div className="add-column">
                  {isAddingSection ? (
                    <div className="add-column-form">
                      <input
                        type="text"
                        placeholder="Введите имя колонки..."
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        autoFocus
                      />
                      <div className="add-column-actions">
                        <button className="add-list-btn" onClick={handleCreateSection}>
                          Добавить список
                        </button>
                        <button className="close-btn" onClick={handleToggleNewSection}>
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="add-column-btn" onClick={handleToggleNewSection}>
                      <FaPlus className="add-icon" /> Добавьте ещё одну колонку
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  );
};

export default BoardPage;
