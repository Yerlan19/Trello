import React, { useEffect, useState } from "react";
import Header from "../../../components/header";
import { FaEllipsisH } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { fetchBoards } from "../../../app/store/slices/boardsSlice";
import "./dashboard.css";

const API_URL = "http://127.0.0.1:8000";

const Dashboard = () => {
    const dispatch = useDispatch();

    const boards = useSelector((state) => state.boards.list);
    const loading = useSelector((state) => state.boards.loading);
    const error = useSelector((state) => state.boards.error);

    const [newBoardTitle, setNewBoardTitle] = useState("");
    const [menuOpen, setMenuOpen] = useState(null);
    const [editingBoard, setEditingBoard] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        dispatch(fetchBoards());
    }, [dispatch]);

    const createBoard = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return (window.location.href = "/login-page");

        const response = await fetch(`${API_URL}/boards?title=${encodeURIComponent(newBoardTitle)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            setNewBoardTitle("");
            setIsCreating(false);
            dispatch(fetchBoards());
        }
    };

    const deleteBoard = async (id) => {
        const token = localStorage.getItem("authToken");
        if (!token) return (window.location.href = "/login-page");

        const response = await fetch(`${API_URL}/boards/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            setMenuOpen(null);
            dispatch(fetchBoards());
        }
    };

    const updateBoard = async (id) => {
        const token = localStorage.getItem("authToken");
        if (!token) return (window.location.href = "/login-page");

        const response = await fetch(`${API_URL}/boards/${id}?newTitle=${encodeURIComponent(editedTitle)}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            setEditingBoard(null);
            setEditedTitle("");
            setMenuOpen(null);
            dispatch(fetchBoards());
        }
    };

    return (
        <div className="dashboard">
            <Header />
            <h1>My Boards</h1>

            {loading && <p>Загрузка...</p>}
            {error && <p className="error">{error}</p>}

            <div className="boards-container">
                {boards.map((board) => (
                    <div key={board.id} className="board-card">
                        <div className="board-header">
                            {editingBoard === board.id ? (
                                <div>
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        autoFocus
                                    />
                                    <button onClick={() => updateBoard(board.id)}>Сохранить</button>
                                </div>
                            ) : (
                                <h2 onClick={() => (window.location.href = `/board/${board.id}`)}>{board.title}</h2>
                            )}

                            <button
                                className="menu-btn"
                                onClick={() => setMenuOpen((prev) => (prev === board.id ? null : board.id))}
                            >
                                <FaEllipsisH />
                            </button>

                            {menuOpen === board.id && (
                                <div className="context-menu">
                                    <button
                                        onClick={() => {
                                            setEditingBoard(board.id);
                                            setEditedTitle(board.title);
                                            setMenuOpen(null);
                                        }}
                                    >
                                        Изменить
                                    </button>
                                    <button onClick={() => deleteBoard(board.id)}>Удалить</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="board-card create-board-card">
                    {isCreating ? (
                        <>
                            <input
                                type="text"
                                placeholder="Название доски"
                                value={newBoardTitle}
                                onChange={(e) => setNewBoardTitle(e.target.value)}
                                autoFocus
                            />
                            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                <button onClick={createBoard}>Создать</button>
                                <button onClick={() => setIsCreating(false)}>Отмена</button>
                            </div>
                        </>
                    ) : (
                        <button onClick={() => setIsCreating(true)}>Создать доску</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;