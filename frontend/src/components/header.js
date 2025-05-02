import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import "../components/header.css";
import { ThemeContext } from "../context/ThemeContext";

const Header = () => {
    const router = useRouter();
    const { theme, toggleTheme } = useContext(ThemeContext);

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            router.push("/login-page");
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        router.push("/login-page");
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-logo" onClick={() => router.push("/board/my-board")}>
                    <h1>Trello</h1>
                </div>

                <nav className="header-nav">
                    <button onClick={() => router.push("/board/my-board")}>My Boards</button>
                    <button onClick={toggleTheme} className="theme-toggle">
                        {theme === "light" ? "🌙" : "🌞"}
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>Exit</button>
                </nav>
            </div>
        </header>
    );
};

export default Header;