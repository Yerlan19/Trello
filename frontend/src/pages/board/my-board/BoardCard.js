import React from "react";
import { FaEllipsisH } from "react-icons/fa";

const BoardCard = React.memo(({
                                  board,
                                  menuOpen,
                                  editingBoard,
                                  editedTitle,
                                  onOpenMenu,
                                  onEditStart,
                                  onUpdate,
                                  onDelete,
                                  onTitleChange
                              }) => {
    return (
        <div className="board-card">
            <div className="board-header">
                {editingBoard === board.id ? (
                    <div>
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={onTitleChange}
                            autoFocus
                        />
                        <button onClick={onUpdate}>Сохранить</button>
                    </div>
                ) : (
                    <h2 onClick={() => window.location.href = `/board/${board.id}`}>
                        {board.title}
                    </h2>
                )}

                <button
                    className="menu-btn"
                    onClick={() => onOpenMenu(prev => (prev === board.id ? null : board.id))}
                >
                    <FaEllipsisH />
                </button>

                {menuOpen === board.id && (
                    <div className="context-menu">
                        <button onClick={onEditStart}>Изменить</button>
                        <button onClick={onDelete}>Удалить</button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default BoardCard;