import React, { memo } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { FaEllipsisH, FaPlus, FaTimes } from "react-icons/fa";
import { CardItem } from "./CardItem";

export const Section = memo(({
  section,
  index,
  editingSection,
  editedTitle,
  menuOpen,
  setMenuOpen,
  onEditTitleChange,
  onEditStart,
  onEditCancel,
  onEditConfirm,
  onDelete,
  onToggleAddCard,
  onCardTitleChange,
  onCreateCard,
  onEditCard, // <-- новый
  onDeleteCard, // <-- новый
  addingCard,
  newCards,
}) => (
  <Draggable draggableId={section?.id?.toString()} index={index}>
    {(provided) => (
      <div
        className="section"
        ref={provided.innerRef}
        {...provided.draggableProps}
        style={provided.draggableProps.style}
      >
        <div className="section-header" {...provided.dragHandleProps}>
          {editingSection === section.id ? (
            <div className="edit-section-title">
              <input
                type="text"
                value={editedTitle}
                onChange={onEditTitleChange}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") onEditConfirm(section.id);
                  if (e.key === "Escape") onEditCancel();
                }}
              />
              <button onClick={() => onEditConfirm(section.id)}>Сохранить</button>
              <button onClick={onEditCancel}>Отмена</button>
            </div>
          ) : (
            <h2 onDoubleClick={() => onEditStart(section.id, section.title)}>
              {section.title}
            </h2>
          )}

          <button
            className="menu-btn"
            onClick={() =>
              setMenuOpen((prev) => (prev === section.id ? null : section.id))
            }
          >
            <FaEllipsisH />
          </button>

          {menuOpen === section.id && (
            <div className="context-menu">
              <button onClick={() => onEditStart(section.id, section.title)}>Изменить</button>
              <button onClick={() => onDelete(section.id)}>Удалить</button>
            </div>
          )}
        </div>

        <Droppable droppableId={section?.id?.toString()} type="CARD">
          {(provided) => (
            <ul className="cards" ref={provided.innerRef} {...provided.droppableProps}>
              {section.cards?.length > 0 ? (
                section.cards.map((card, cardIndex) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    sectionId={section.id} 
                    onEditCard={(id, title, desc) => onEditCard(section.id, id, title, desc)}
                    onDeleteCard={(id) => onDeleteCard(section.id, id)}
                  />
                ))
              ) : (
                <li className="no-cards">Нет карточек</li>
              )}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>

        <div className="add-card">
          {addingCard[section.id] ? (
            <div className="add-card-form">
              <textarea
                placeholder="Введите название или вставьте ссылку"
                value={newCards[section.id]?.title || ""}
                onChange={(e) => onCardTitleChange(section.id, e.target.value)}
                autoFocus
              />
              <div className="add-card-actions">
                <button
                  className="add-card-btn"
                  onClick={() => onCreateCard(section.id)}
                >
                  Добавить карточку
                </button>
                <button
                  className="close-btn"
                  onClick={() => onToggleAddCard(section.id)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="add-card-btn"
              onClick={() => onToggleAddCard(section.id)}
            >
              <FaPlus className="add-icon" /> Добавить карточку
            </button>
          )}
        </div>
      </div>
    )}
  </Draggable>
));
