import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import "../login-page/login-page.css"


const API_URL = "http://127.0.0.1:8000";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [formData, setFormData] = useState({ username: "", password: "" });

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        try {
            const response = await fetch(`${API_URL}/sign-in`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: formData.username, password: formData.password }),
            });

            const responseData = await response.json();
            if (!response.ok || !responseData.token) {
                setErrorMessage("Неверный логин или пароль");
                return;
            }

            localStorage.setItem("authToken", responseData.token);
            window.location.href = "/board/my-board";
        } catch {
            setErrorMessage("Не удалось войти. Проверьте подключение.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-page-main">
                <div className="login-page-logo">
                    <button onClick={() => (window.location.href = "/")}>
                        <RxCross1 />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="login-page-form">
                    <div className="login-page-form-login">
                        <h3>Логин</h3>
                        <input
                            type="text"
                            name="username"
                            placeholder="Введите логин"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="login-page-form-password">
                        <div className="login-page-form-password-top">
                            <h3>Пароль</h3>
                        </div>
                        <div className="login-page-form-password-bot">
                            <input
                                type={showPassword ? "password" : "text"}
                                name="password"
                                placeholder="Введите пароль"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button type="button" onClick={togglePasswordVisibility} className="eye-icon">
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </div>
                    <button type="submit">Войти</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;