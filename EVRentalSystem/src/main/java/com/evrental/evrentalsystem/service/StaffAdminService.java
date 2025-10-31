package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.response.admin.StaffItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
import java.sql.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffAdminService {

    private final DataSource dataSource;

    public StaffItemResponse getStaffList(String search,
                                          Integer stationId,
                                          String position,
                                          String status,
                                          int page,
                                          int size) {

        String normSearch   = normalize(search);
        Integer normStation = stationId;
        String normPosition = normalize(position);
        String normStatus   = normalize(status);
        if (normStatus != null) normStatus = normStatus.toUpperCase(); // DB đang lưu ACTIVE/...

        StringBuilder where = new StringBuilder(" WHERE u.[role] = 'STAFF' ");
        List<Object> params = new ArrayList<>();
        if (normSearch != null) {
            where.append(" AND (u.[full_name] LIKE ? OR u.[email] LIKE ? OR CAST(u.[user_id] AS NVARCHAR(50)) LIKE ?) ");
            String like = "%" + normSearch + "%";
            params.add(like); params.add(like); params.add(like);
        }
        if (normStation != null) {
            where.append(" AND ed.[station_id] = ? ");
            params.add(normStation);
        }
        if (normPosition != null) {
            // dùng cột role như position
            where.append(" AND u.[role] = ? ");
            params.add(normPosition);
        }
        if (normStatus != null) {
            where.append(" AND u.[status] = ? ");
            params.add(normStatus);
        }

        // Tính range phân trang
        int start = Math.max(1, (page <= 1 ? 1 : ((page - 1) * size + 1)));
        int end   = start + Math.max(1, size) - 1;

        // 1) Page data với ROW_NUMBER
        String pageSql =
                "WITH F AS ( " +
                        "  SELECT " +
                        "    u.[user_id] AS id, u.[full_name] AS name, u.[email] AS email, u.[role] AS position, u.[status] AS emp_status, u.[phone] AS phone, u.[created_at] AS join_date," +
                        "    ed.[station_id] AS station_id, s.[station_name] AS station_name, " +
                        "    ISNULL((SELECT COUNT(*) FROM [Inspection] i WHERE i.[staff_id] = u.[user_id]), 0) AS handovers, " +
                        "    (SELECT AVG(CAST(r.[rating] AS FLOAT)) " +
                        "       FROM [Contract] c JOIN [Booking] b ON b.[booking_id] = c.[booking_id] " +
                        "       LEFT JOIN [Review] r ON r.[booking_id] = b.[booking_id] " +
                        "      WHERE c.[staff_id] = u.[user_id]) AS avg_rating, " +
                        "    (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE CAST(100.0 * SUM(CASE WHEN b.[actual_return_time] IS NOT NULL " +
                        "           AND b.[actual_return_time] <= b.[expected_return_time] THEN 1 ELSE 0 END) / COUNT(*) AS INT) END " +
                        "       FROM [Contract] c JOIN [Booking] b ON b.[booking_id] = c.[booking_id] " +
                        "      WHERE c.[staff_id] = u.[user_id]) AS on_time_rate, " +
                        "    (SELECT CASE WHEN COUNT(r.[rating]) = 0 THEN 0 ELSE CAST(100.0 * SUM(CASE WHEN r.[rating] >= 4 THEN 1 ELSE 0 END) " +
                        "           / COUNT(r.[rating]) AS INT) END " +
                        "       FROM [Contract] c JOIN [Booking] b ON b.[booking_id] = c.[booking_id] " +
                        "       LEFT JOIN [Review] r ON r.[booking_id] = b.[booking_id] " +
                        "      WHERE c.[staff_id] = u.[user_id]) AS customer_satisfaction, " +
                        "    CAST(0 AS INT) AS shifts_this_month, CAST(0 AS INT) AS shifts_total, " +
                        "    ROW_NUMBER() OVER (ORDER BY u.[full_name] ASC, u.[user_id] ASC) AS rn " +
                        "  FROM [User] u " +
                        "  JOIN [Employee_Detail] ed ON ed.[employee_id] = u.[user_id] " +
                        "  JOIN [Station] s          ON s.[station_id]   = ed.[station_id] " +
                        where +
                        ") " +
                        "SELECT * FROM F WHERE rn BETWEEN ? AND ? " +
                        "ORDER BY rn;";

        // 2) Total
        String totalSql =
                "SELECT COUNT(*) AS [Total] " +
                        "FROM [User] u " +
                        "JOIN [Employee_Detail] ed ON ed.[employee_id] = u.[user_id] " +
                        "JOIN [Station] s          ON s.[station_id]   = ed.[station_id] " +
                        where;

        // 3) KPIs
        String kpiSql =
                "SELECT " +
                        "  COUNT(*) AS [TotalStaff], " +
                        "  SUM(CASE WHEN u.[status] = 'ACTIVE' THEN 1 ELSE 0 END) AS [ActiveCount], " +
                        "  AVG(COALESCE(ravg.[avg_rating], 0)) AS [AvgRating], " +
                        "  SUM(COALESCE(hc.[handovers], 0)) AS [TotalHandovers] " +
                        "FROM [User] u " +
                        "JOIN [Employee_Detail] ed ON ed.[employee_id] = u.[user_id] " +
                        "JOIN [Station] s          ON s.[station_id]   = ed.[station_id] " +

                        // Tính avg_rating/handovers theo từng user bằng OUTER APPLY (tránh aggregate trên subquery)
                        "OUTER APPLY ( " +
                        "   SELECT AVG(CAST(r.[rating] AS FLOAT)) AS [avg_rating] " +
                        "   FROM [Contract] c " +
                        "   JOIN [Booking] b ON b.[booking_id] = c.[booking_id] " +
                        "   LEFT JOIN [Review] r ON r.[booking_id] = b.[booking_id] " +
                        "   WHERE c.[staff_id] = u.[user_id] " +
                        ") ravg " +
                        "OUTER APPLY ( " +
                        "   SELECT COUNT(*) AS [handovers] " +
                        "   FROM [Inspection] i " +
                        "   WHERE i.[staff_id] = u.[user_id] " +
                        ") hc " +
                        // Áp lại cùng bộ lọc
                        where.toString();
        List<StaffItemResponse.StaffItem> items = new ArrayList<>();
        long total = 0;
        StaffItemResponse.Kpis kpis = new StaffItemResponse.Kpis(0, 0, 0.0, 0);

        try (Connection con = dataSource.getConnection()) {
            // page
            try (PreparedStatement ps = con.prepareStatement(pageSql)) {
                int idx = bindWhere(ps, params);
                ps.setInt(idx++, start);
                ps.setInt(idx,   end);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        StaffItemResponse.StaffItem it = new StaffItemResponse.StaffItem();
                        it.setId(rs.getInt("id"));
                        it.setName(rs.getString("name"));
                        it.setEmail(rs.getString("email"));
                        it.setPosition(rs.getString("position"));
                        it.setStatus(rs.getString("emp_status"));
                        it.setStationId(rs.getInt("station_id"));
                        it.setStationName(rs.getString("station_name"));
                        it.setPhone(rs.getString("phone"));
                        Timestamp ts = rs.getTimestamp("join_date");
                        it.setJoinDate(ts != null ? ts.toLocalDateTime() : null);
                        it.setHandovers(getIntSafe(rs, "handovers"));
                        it.setAvgRating(getDoubleSafe(rs, "avg_rating"));
                        it.setOnTimeRate(getIntSafe(rs, "on_time_rate"));
                        it.setCustomerSatisfaction(getIntSafe(rs, "customer_satisfaction"));
                        it.setShiftsThisMonth(getIntSafe(rs, "shifts_this_month"));
                        it.setShiftsTotal(getIntSafe(rs, "shifts_total"));
                        items.add(it);
                    }
                }
            }

            // total
            try (PreparedStatement ps = con.prepareStatement(totalSql)) {
                bindWhere(ps, params);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) total = rs.getLong("Total");
                }
            }

            // kpis
            try (PreparedStatement ps = con.prepareStatement(kpiSql)) {
                bindWhere(ps, params);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        kpis.setTotalStaff(rs.getLong("TotalStaff"));
                        kpis.setActiveCount(rs.getLong("ActiveCount"));
                        kpis.setAvgRating(rs.getDouble("AvgRating"));
                        kpis.setTotalHandovers(rs.getLong("TotalHandovers"));
                    }
                }
            }

        } catch (SQLException e) {
            // log chi tiết để debug nếu cần
            System.err.println("[Staff list] SQL error: " + e.getMessage());
            throw new RuntimeException("Staff list query failed", e);
        }

        return new StaffItemResponse(items, kpis, page, size, total);
    }

    /** Detail 1 nhân viên (NO VIEW) */
    public StaffItemResponse.StaffItem getStaffDetail(int id) {
        String sql =
                "SELECT " +
                        "  u.user_id       AS id, " +
                        "  u.full_name     AS name, " +
                        "  u.email         AS email, " +
                        "  u.role          AS position, " +
                        "  u.status        AS status, " +
                        "  u.phone         AS phone, " +
                        "  u.created_at    AS join_date, " +
                        "  ed.station_id   AS station_id, " +
                        "  s.station_name  AS station_name, " +
                        "  ISNULL((SELECT COUNT(*) FROM Inspection i WHERE i.staff_id = u.user_id), 0) AS handovers, " +
                        "  (SELECT AVG(CAST(r.rating AS FLOAT)) " +
                        "     FROM Contract c " +
                        "     JOIN Booking b ON b.booking_id = c.booking_id " +
                        "     LEFT JOIN Review r ON r.booking_id = b.booking_id " +
                        "    WHERE c.staff_id = u.user_id) AS avg_rating, " +
                        "  (SELECT CASE WHEN COUNT(*) = 0 THEN 0 " +
                        "              ELSE CAST(100.0 * SUM(CASE WHEN b.actual_return_time IS NOT NULL " +
                        "                                           AND b.actual_return_time <= b.expected_return_time THEN 1 ELSE 0 END) " +
                        "                   / COUNT(*) AS INT) END " +
                        "     FROM Contract c " +
                        "     JOIN Booking b ON b.booking_id = c.booking_id " +
                        "    WHERE c.staff_id = u.user_id) AS on_time_rate, " +
                        "  (SELECT CASE WHEN COUNT(r.rating) = 0 THEN 0 " +
                        "              ELSE CAST(100.0 * SUM(CASE WHEN r.rating >= 4 THEN 1 ELSE 0 END) / COUNT(r.rating) AS INT) END " +
                        "     FROM Contract c " +
                        "     JOIN Booking b ON b.booking_id = c.booking_id " +
                        "     LEFT JOIN Review r ON r.booking_id = b.booking_id " +
                        "    WHERE c.staff_id = u.user_id) AS customer_satisfaction, " +
                        "  CAST(0 AS INT) AS shifts_this_month, " +
                        "  CAST(0 AS INT) AS shifts_total " +
                        "FROM [User] u " +
                        "JOIN Employee_Detail ed ON ed.employee_id = u.user_id " +
                        "JOIN Station s          ON s.station_id   = ed.station_id " +
                        "WHERE u.role = 'STAFF' AND u.user_id = ? ";

        try (Connection con = dataSource.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found: " + id);
                }
                StaffItemResponse.StaffItem it = new StaffItemResponse.StaffItem();
                it.setId(rs.getInt("id"));
                it.setName(rs.getString("name"));
                it.setEmail(rs.getString("email"));
                it.setPosition(rs.getString("position"));
                it.setStatus(rs.getString("status"));
                it.setStationId(rs.getInt("station_id"));
                it.setStationName(rs.getString("station_name"));
                it.setPhone(rs.getString("phone"));
                Timestamp ts = rs.getTimestamp("join_date");
                it.setJoinDate(ts != null ? ts.toLocalDateTime() : null);
                it.setHandovers(getIntSafe(rs, "handovers"));
                it.setAvgRating(getDoubleSafe(rs, "avg_rating"));
                it.setOnTimeRate(getIntSafe(rs, "on_time_rate"));
                it.setCustomerSatisfaction(getIntSafe(rs, "customer_satisfaction"));
                it.setShiftsThisMonth(getIntSafe(rs, "shifts_this_month"));
                it.setShiftsTotal(getIntSafe(rs, "shifts_total"));
                return it;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Staff detail query failed", e);
        }
    }

    public StaffItemResponse.StaffItem updateStaffStation(int staffId, Integer stationId) {
        if (stationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "stationId must not be null");
        }

        final String checkUserSql =
                "SELECT COUNT(*) FROM [User] WHERE user_id = ? AND [role] = 'STAFF'";
        final String checkStationSql =
                "SELECT COUNT(*) FROM [Station] WHERE station_id = ?";
        final String checkEmpSql =
                "SELECT COUNT(*) FROM [Employee_Detail] WHERE employee_id = ?";
        final String insertEmpSql =
                "INSERT INTO [Employee_Detail](employee_id, station_id) VALUES(?, ?)";
        final String updateEmpSql =
                "UPDATE [Employee_Detail] SET station_id = ? WHERE employee_id = ?";

        try (Connection con = dataSource.getConnection()) {
            con.setAutoCommit(false);

            // 1) kiểm tra staff có tồn tại không
            try (PreparedStatement ps = con.prepareStatement(checkUserSql)) {
                ps.setInt(1, staffId);
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    if (rs.getInt(1) == 0) {
                        con.rollback();
                        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found: " + staffId);
                    }
                }
            }

            // 2) kiểm tra trạm
            try (PreparedStatement ps = con.prepareStatement(checkStationSql)) {
                ps.setInt(1, stationId);
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    if (rs.getInt(1) == 0) {
                        con.rollback();
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Station not found: " + stationId);
                    }
                }
            }

            // 3) cập nhật hoặc tạo mới Employee_Detail
            boolean exists;
            try (PreparedStatement ps = con.prepareStatement(checkEmpSql)) {
                ps.setInt(1, staffId);
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    exists = rs.getInt(1) > 0;
                }
            }

            if (exists) {
                try (PreparedStatement ps = con.prepareStatement(updateEmpSql)) {
                    ps.setInt(1, stationId);
                    ps.setInt(2, staffId);
                    ps.executeUpdate();
                }
            } else {
                try (PreparedStatement ps = con.prepareStatement(insertEmpSql)) {
                    ps.setInt(1, staffId);
                    ps.setInt(2, stationId);
                    ps.executeUpdate();
                }
            }

            con.commit();
            return getStaffDetail(staffId);
        } catch (SQLException e) {
            throw new RuntimeException("Update staff station failed", e);
        }
    }

    // =============================
    // (3) PATCH STAFF INFO
    // =============================
    public StaffItemResponse.StaffItem patchStaff(
            int staffId,
            String email,
            String phone,
            String status,
            Integer stationId
    ) {
        final String checkUserSql =
                "SELECT COUNT(*) FROM [User] WHERE user_id = ? AND [role] = 'STAFF'";

        try (Connection con = dataSource.getConnection()) {
            con.setAutoCommit(false);

            // 1) kiểm tra nhân viên hợp lệ
            try (PreparedStatement ps = con.prepareStatement(checkUserSql)) {
                ps.setInt(1, staffId);
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    if (rs.getInt(1) == 0) {
                        con.rollback();
                        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found: " + staffId);
                    }
                }
            }

            // 2) cập nhật bảng User
            StringBuilder sql = new StringBuilder("UPDATE [User] SET ");
            List<Object> sets = new ArrayList<>();
            if (email != null) { sql.append(" [email] = ?,"); sets.add(email.trim()); }
            if (phone != null) { sql.append(" [phone] = ?,"); sets.add(phone.trim()); }
            if (status != null) { sql.append(" [status] = ?,"); sets.add(status.trim().toUpperCase()); }

            if (!sets.isEmpty()) {
                sql.setLength(sql.length() - 1); // bỏ dấu phẩy cuối
                sql.append(" WHERE user_id = ?");
                try (PreparedStatement ps = con.prepareStatement(sql.toString())) {
                    int i = 1;
                    for (Object v : sets) ps.setString(i++, v.toString());
                    ps.setInt(i, staffId);
                    ps.executeUpdate();
                }
            }

            // 3) nếu FE gửi stationId thì đổi trạm luôn
            if (stationId != null) {
                final String checkStationSql =
                        "SELECT COUNT(*) FROM [Station] WHERE station_id = ?";
                final String checkEmpSql =
                        "SELECT COUNT(*) FROM [Employee_Detail] WHERE employee_id = ?";
                final String insertEmpSql =
                        "INSERT INTO [Employee_Detail](employee_id, station_id) VALUES(?, ?)";
                final String updateEmpSql =
                        "UPDATE [Employee_Detail] SET station_id = ? WHERE employee_id = ?";

                try (PreparedStatement ps = con.prepareStatement(checkStationSql)) {
                    ps.setInt(1, stationId);
                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();
                        if (rs.getInt(1) == 0) {
                            con.rollback();
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Station not found: " + stationId);
                        }
                    }
                }

                boolean exists;
                try (PreparedStatement ps = con.prepareStatement(checkEmpSql)) {
                    ps.setInt(1, staffId);
                    try (ResultSet rs = ps.executeQuery()) {
                        rs.next();
                        exists = rs.getInt(1) > 0;
                    }
                }

                if (exists) {
                    try (PreparedStatement ps = con.prepareStatement(updateEmpSql)) {
                        ps.setInt(1, stationId);
                        ps.setInt(2, staffId);
                        ps.executeUpdate();
                    }
                } else {
                    try (PreparedStatement ps = con.prepareStatement(insertEmpSql)) {
                        ps.setInt(1, staffId);
                        ps.setInt(2, stationId);
                        ps.executeUpdate();
                    }
                }
            }

            con.commit();
            return getStaffDetail(staffId);
        } catch (SQLException e) {
            throw new RuntimeException("Patch staff failed", e);
        }
    }

    public void transferStation(int employeeId, int newStationId) {
        String checkStation = "SELECT 1 FROM Station WHERE station_id = ?";
        String checkEmp     = "SELECT 1 FROM Employee_Detail WHERE employee_id = ?";
        String updateSql    = "UPDATE Employee_Detail SET station_id = ? WHERE employee_id = ?";

        try (Connection con = dataSource.getConnection()) {

            // station tồn tại?
            try (PreparedStatement ps = con.prepareStatement(checkStation)) {
                ps.setInt(1, newStationId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Station not found: " + newStationId);
                    }
                }
            }

            // employee_detail tồn tại?
            boolean hasEmpDetail;
            try (PreparedStatement ps = con.prepareStatement(checkEmp)) {
                ps.setInt(1, employeeId);
                try (ResultSet rs = ps.executeQuery()) {
                    hasEmpDetail = rs.next();
                }
            }

            if (!hasEmpDetail) {
                // nếu cần auto-create dòng employee_detail:
                try (PreparedStatement ps = con.prepareStatement(
                        "INSERT INTO Employee_Detail(employee_id, station_id) VALUES (?, ?)")) {
                    ps.setInt(1, employeeId);
                    ps.setInt(2, newStationId);
                    ps.executeUpdate();
                    return;
                }
            }

            try (PreparedStatement ps = con.prepareStatement(updateSql)) {
                ps.setInt(1, newStationId);
                ps.setInt(2, employeeId);
                int updated = ps.executeUpdate();
                if (updated == 0) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Employee not found: " + employeeId);
                }
            }

        } catch (SQLException e) {
            System.err.println("[transferStation] SQL error: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Transfer station failed", e);
        }
    }

    // ------------ helpers ------------
    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() || "all".equalsIgnoreCase(t) ? null : t;
    }

    private int bindWhere(PreparedStatement ps, List<Object> params) throws SQLException {
        int idx = 1;
        for (Object p : params) {
            if (p instanceof Integer) ps.setInt(idx++, (Integer) p);
            else ps.setString(idx++, (String) p);
        }
        return idx;
    }

    private int getIntSafe(ResultSet rs, String col) throws SQLException {
        int v = rs.getInt(col);
        return rs.wasNull() ? 0 : v;
    }

    private double getDoubleSafe(ResultSet rs, String col) throws SQLException {
        double v = rs.getDouble(col);
        return rs.wasNull() ? 0d : v;
    }
}
