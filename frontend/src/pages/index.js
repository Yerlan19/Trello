import { useEffect } from "react";

const IndexPage = () => {
    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("authToken");

            if (token) {
                window.location.href = "/board/my-board";
            } else {
                window.location.href = "/login-page";
            }
        }
    }, []);

    return null;
};

export default IndexPage;