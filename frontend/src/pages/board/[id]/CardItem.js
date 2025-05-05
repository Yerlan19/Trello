import React, { memo, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

export const CardItem = memo(({ card, index, sectionId, onEditCard, onDeleteCard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedDescription, setEditedDescription] = useState(card.description || "");

  const handleSave = () => {
    if (!editedTitle.trim()) return;
    onEditCard(sectionId, card.id, editedTitle, editedDescription);
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={card.id.toString()} index={index}>
      {(provided) => (
        <li
          className="card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
              <div className="card-actions">
                <button onClick={handleSave}><FaSave /></button>
                <button onClick={() => setIsEditing(false)}><FaTimes /></button>
              </div>
            </>
          ) : (
            <>
              <h3>{card.title}</h3>
              <p>{card.description || "Нет описания"}</p>
              <div className="card-actions">
                <button onClick={() => setIsEditing(true)}><FaEdit /></button>
                <button onClick={() => onDeleteCard(sectionId, card.id)}><FaTrash /></button>
              </div>
            </>
          )}
        </li>
      )}
    </Draggable>
  );
});


