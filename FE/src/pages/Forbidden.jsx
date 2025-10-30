import React from "react";
import { useNavigate } from "react-router-dom";
import "./Forbidden.css";
import Illustration from "/403.gif"; // đặt ảnh vào src/assets/403-illustration.png

export default function Forbidden() {
    const navigate = useNavigate();

    return (
        <main className="forbidden-page" role="main">
            <div className="forbidden-card">
                <div className="forbidden-visual">
                    <img src={Illustration} alt="403 restricted access illustration" />
                </div>

                <div className="forbidden-content">
                    <h1 className="forbidden-code">403</h1>
                    <h2 className="forbidden-title">We are Sorry...</h2>
                    <p className="forbidden-desc">
                        The page you're trying to access has restricted access.
                        <br />
                        Please refer to your system administrator.
                    </p>

                    <div className="forbidden-actions">
                        <button
                            className="btn-go-back"
                            onClick={() => navigate("/", { replace: true })}
                            aria-label="Go back to homepage"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
