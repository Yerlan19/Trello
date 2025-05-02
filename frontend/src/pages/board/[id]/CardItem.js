import React, { memo } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { FaEllipsisH, FaPlus, FaTimes } from "react-icons/fa";

export const CardItem = memo(({ card, index }) => (
    <Draggable draggableId={card.id.toString()} index={index}>
        {(provided) => (
            <li
                className="card"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
            >
                <h3>{card.title}</h3>
                <p>{card.description || "Нет описания"}</p>
            </li>
        )}
    </Draggable>
));