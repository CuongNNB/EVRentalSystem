import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./UserContract.css";

export default function UserContract() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userName, setUserName] = useState("Người thuê");
    const [filter, setFilter] = useState("all"); // all | pending | signed
    const [sortOrder, setSortOrder] = useState("desc"); // desc | asc
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContracts = async () => {
            setLoading(true);
            setError("");

            const rawUser = localStorage.getItem("ev_user");
            if (!rawUser) {
                setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.");
                setLoading(false);
                return;
            }

            let parsedUser;
            try {
                parsedUser = JSON.parse(rawUser);
                const name =
                    parsedUser?.fullName ||
                    parsedUser?.name ||
                    parsedUser?.username ||
                    "Người thuê";
                setUserName(name);
            } catch (err) {
                setError("Dữ liệu người dùng không hợp lệ.");
                setLoading(false);
                return;
            }

            const userId =
                parsedUser?.id ??
                parsedUser?.userId ??
                parsedUser?.data?.id ??
                parsedUser?.user?.id ??
                null;

            if (!userId) {
                setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
                setLoading(false);
                return;
            }

            const url = `http://localhost:8084/EVRentalSystem/api/contracts?userId=${encodeURIComponent(
                userId
            )}`;

            try {
                const res = await fetch(url, { method: "GET" });
                if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);

                const data = await res.json();
                const list = Array.isArray(data) ? data : [];

                const mapStatus = (status) => {
                    if (!status) return "-";
                    const s = String(status).toUpperCase();
                    if (s.includes("PENDING")) return "Đang chờ ký";
                    if (s.includes("SIGNED")) return "Đã ký";
                    return status;
                };

                const normalized = list.map((c) => ({
                    contractId: c.contractId ?? c.id ?? `B-${c.bookingId}`,
                    statusRaw: c.status ?? c.bookingStatus ?? "",
                    status: mapStatus(c.status ?? c.bookingStatus),
                    startTime: c.startTime ?? c.createdAt ?? null,
                    staffName: c.staffName ?? "Chưa có nhân viên",
                    original: c,
                }));

                setContracts(normalized);
            } catch (err) {
                console.error("Lỗi khi fetch:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, []);

    const handleSignContract = (contract) => {
        navigate(`/contract/${contract.contractId}`, {
            state: { contract: contract.original || contract },
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleString("vi-VN", {
            dateStyle: "short",
            timeStyle: "short",
        });
    };

    // Lọc theo filter
    const visibleContracts = useMemo(() => {
        const filtered =
            filter === "pending"
                ? contracts.filter((c) =>
                    String(c.statusRaw || c.status).toUpperCase().includes("PENDING")
                )
                : filter === "signed"
                    ? contracts.filter((c) =>
                        String(c.statusRaw || c.status).toUpperCase().includes("SIGNED")
                    )
                    : contracts;

        // Sắp xếp theo ngày
        return filtered.sort((a, b) => {
            const ta = new Date(a.startTime).getTime() || 0;
            const tb = new Date(b.startTime).getTime() || 0;
            return sortOrder === "asc" ? ta - tb : tb - ta;
        });
    }, [contracts, filter, sortOrder]);

    const toggleSort = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    return (
        <div className="user-contract-page">
            <Header />
            <main className="user-contract-main">
                <div className="user-contract-container">
                    <h1 className="page-title">Danh sách hợp đồng của bạn</h1>

                    {/* Filter */}
                    <div className="contract-filters">
                        <button
                            className={`filter-btn ${filter === "all" ? "active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            Tất cả
                        </button>
                        <button
                            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
                            onClick={() => setFilter("pending")}
                        >
                            Đang chờ ký
                        </button>
                        <button
                            className={`filter-btn ${filter === "signed" ? "active" : ""}`}
                            onClick={() => setFilter("signed")}
                        >
                            Đã ký
                        </button>
                    </div>

                    {loading ? (
                        <p className="empty-message">Đang tải danh sách hợp đồng...</p>
                    ) : error ? (
                        <p className="empty-message" style={{ color: "#c53030" }}>
                            {error}
                        </p>
                    ) : visibleContracts.length === 0 ? (
                        <p className="empty-message">Không có hợp đồng nào để hiển thị.</p>
                    ) : (
                        <table className="contract-table">
                            <thead>
                            <tr>
                                <th>MÃ HỢP ĐỒNG</th>
                                <th>KHÁCH HÀNG</th>
                                <th>NHÂN VIÊN PHỤ TRÁCH</th>
                                <th>
                                    <button
                                        className={`sort-btn ${sortOrder}`}
                                        onClick={toggleSort}
                                    >
                                        Ngày tạo
                                        <span className="sort-arrow">▲</span>
                                    </button>
                                </th>
                                <th>TRẠNG THÁI</th>
                                <th>HÀNH ĐỘNG</th>
                            </tr>
                            </thead>
                            <tbody>
                            {visibleContracts.map((contract, idx) => (
                                <tr key={idx}>
                                    <td>{contract.contractId}</td>
                                    <td>{userName}</td>
                                    <td>{contract.staffName}</td>
                                    <td>{formatDateTime(contract.startTime)}</td>
                                    <td>
                      <span
                          className={`status-badge ${
                              contract.status === "Đang chờ ký"
                                  ? "pending"
                                  : contract.status === "Đã ký"
                                      ? "signed"
                                      : ""
                          }`}
                      >
                        {contract.status}
                      </span>
                                    </td>
                                    <td>
                                        {contract.status === "Đang chờ ký" && (
                                            <button
                                                className="btn-view"
                                                onClick={() => handleSignContract(contract)}
                                            >
                                                Ký hợp đồng
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
