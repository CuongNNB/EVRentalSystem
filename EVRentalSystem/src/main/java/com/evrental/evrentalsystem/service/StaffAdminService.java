package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.response.admin.StaffItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * StaffAdminService - KHÔNG dùng SP/View.
 * Dùng SQL thuần theo schema EVRentalSystem bạn đã cung cấp.
 */
@Service
@RequiredArgsConstructor
public class StaffAdminService {

    private final DataSource dataSource;

    /** List + filter + pagination + KPIs (NO SP/VIEW) */
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

        // WHERE chung (escape identifiers)
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
                        "    u.[user_id] AS id, u.[full_name] AS name, u.[email] AS email, u.[role] AS position, u.[status] AS emp_status, " +
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
                        it.setStatus(rs.getString("emp_status")); // <— alias tránh đụng từ khóa
                        it.setStationId(rs.getInt("station_id"));
                        it.setStationName(rs.getString("station_name"));
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
