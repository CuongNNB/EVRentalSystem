// src/pages/PromoPage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MOCK = [
    {
        promotionId: 1,
        promoName: "EV200OFF",
        code: "GIẢM 20% TOÀN BỘ ĐƠN HÀNG",
        discountPercent: 20,
        startTime: "2025-10-01T00:00:00Z",
        endTime: "2025-12-31T23:59:59Z",
        status: "ACTIVE",
    },
    {
        promotionId: 2,
        promoName: "FREE2H",
        code: "MIỄN PHÍ 2H THUÊ XE ĐẦU TIÊN",
        discountPercent: 0,
        startTime: "2025-10-05T00:00:00Z",
        endTime: "2025-11-15T23:59:59Z",
        status: "ACTIVE",
    },
    {
        promotionId: 3,
        promoName: "DEC500K",
        code: "ƯU ĐÃI THÁNG 12 GIẢM 500K",
        discountPercent: 0,
        startTime: "2025-11-01T00:00:00Z",
        endTime: "2025-12-31T23:59:59Z",
        status: "ACTIVE",
    },
];

// Bộ gradient pastel hoặc vivid để random
const GRADIENTS = [
    "linear-gradient(135deg, #a8edea, #fed6e3)",
    "linear-gradient(135deg, #f6d365, #fda085)",
    "linear-gradient(135deg, #84fab0, #8fd3f4)",
    "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
    "linear-gradient(135deg, #ffecd2, #fcb69f)",
    "linear-gradient(135deg, #cfd9df, #e2ebf0)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
];

export default function PromoPage() {
    const [promos, setPromos] = useState([]);
    const [gradients, setGradients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const res = await fetch(
                    "http://localhost:8084/EVRentalSystem/api/promotions/valid"
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (mounted && Array.isArray(data)) {
                    setPromos(data);
                } else if (mounted) {
                    setPromos(MOCK);
                }
            } catch (err) {
                console.warn("Không lấy được API promotions, dùng mock:", err);
                setErrorMsg("Không thể tải dữ liệu từ server — đang hiển thị dữ liệu mẫu.");
                if (mounted) setPromos(MOCK);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, []);

    // Khi có danh sách promos → random gradient cho từng card
    useEffect(() => {
        if (promos.length > 0) {
            const newGradients = promos.map(
                () => GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
            );
            setGradients(newGradients);
        }
    }, [promos]);

    const formatDate = (s) => {
        if (!s) return "Không xác định";
        const d = new Date(s);
        if (isNaN(d.getTime())) return s;
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const copyToClipboard = async (text, el) => {
        try {
            await navigator.clipboard.writeText(text);
            if (el) {
                const original = el.innerText;
                el.innerText = "Đã sao chép";
                setTimeout(() => (el.innerText = original), 1200);
            }
        } catch {
            alert("Không thể sao chép mã");
        }
    };

    // CSS
    useEffect(() => {
        const id = "promo-page-style";
        if (document.getElementById(id)) return;
        const style = document.createElement("style");
        style.id = id;
        style.innerHTML = `
      .promo-wrapper { display:flex; justify-content:center; padding:40px 20px; background:#f3f6f8; }
      .promo-card-shell {
        width:100%;
        max-width:1120px;
        border-radius:24px;
        background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
        padding:28px;
        box-shadow: 0 10px 30px rgba(16,24,40,0.06);
        position:relative;
      }
      .promo-hero { display:flex; align-items:flex-start; gap:24px; margin-bottom:22px; }
      .hero-text { flex:1; }
      .cards-row { display:grid; grid-template-columns: repeat(3, 1fr); gap:18px; }
      @media (max-width:980px) { .cards-row { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width:640px) {
        .promo-card-shell { padding:18px; border-radius:16px; }
        .cards-row { grid-template-columns: 1fr; }
        .promo-hero { flex-direction:column; gap:12px; }
      }
      .promo-item {
        border-radius:16px;
        padding:18px;
        color:#06202a;
        min-height:170px;
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        position:relative;
        box-shadow: 0 15px 30px rgba(11,22,34,0.06);
        transition: transform 0.2s ease;
      }
      .promo-item:hover { transform: translateY(-3px); }
      .promo-item .title { font-weight:800; font-size:18px; margin:0 0 8px 0; color:rgba(3,15,26,0.95); }
      .promo-pill {
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:8px 12px;
        border-radius:999px;
        background: rgba(255,255,255,0.85);
        box-shadow: inset 0 -2px 6px rgba(0,0,0,0.03);
        font-weight:800;
      }
      .small-meta { font-size:12px; color:rgba(6,24,34,0.6); }

      /* Nút Sao chép chính */
      .action-btn {
        margin-top:10px;
        background: linear-gradient(135deg, #0bb97f, #06b6d4);
        color:white;
        padding:10px 14px;
        border-radius:12px;
        border:none;
        font-weight:800;
        cursor:pointer;
        transition: all 0.3s ease;
      }
      .action-btn:hover {
        background:white;
        color:#0bb97f;
        box-shadow: 0 0 0 2px rgba(11,185,127,0.3) inset;
      }
    `;
        document.head.appendChild(style);
    }, []);

    return (
        <div>
            <Header />
            <div className="promo-wrapper" aria-live="polite">
                <div className="promo-card-shell" role="main">
                    <div className="promo-hero">
                        <div className="hero-text">
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 28,
                                    lineHeight: 1.05,
                                    color: "#06202a",
                                    fontWeight: 900,
                                }}
                            >
                                Ưu đãi độc quyền cho hành trình xanh của bạn
                            </h2>
                        </div>
                    </div>

                    <div className="cards-row">
                        {promos.map((raw, idx) => {
                            const item = {
                                id: raw.promotionId ?? raw.id ?? idx,
                                promoName: raw.promoName ?? raw.promo_name ?? raw.name,
                                code: raw.code ?? raw.description ?? "",
                                endTime: raw.endTime ?? raw.end ?? raw.expiry,
                            };

                            return (
                                <div
                                    key={item.id}
                                    className="promo-item"
                                    style={{
                                        background: gradients[idx] || GRADIENTS[0],
                                    }}
                                >
                                    <div>
                                        <h3 className="title">{item.code}</h3>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 10,
                                                alignItems: "center",
                                                marginTop: 6,
                                            }}
                                        >
                                            <div className="promo-pill">
                                                <strong style={{ fontSize: 14 }}>
                                                    {item.promoName}
                                                </strong>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 12 }} className="small-meta">
                                            Có hạn đến: <strong>{formatDate(item.endTime)}</strong>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <button
                                            className="action-btn"
                                            onClick={(e) =>
                                                copyToClipboard(item.promoName, e.currentTarget)
                                            }
                                        >
                                            Sao chép
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
