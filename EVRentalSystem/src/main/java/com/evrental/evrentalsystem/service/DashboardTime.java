package com.evrental.evrentalsystem.service;

import java.time.*;
import java.time.format.DateTimeFormatter;

public final class DashboardTime {
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    public static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter ISO_LDT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private DashboardTime(){}

    public static LocalDate[] range(String from, String to, int defaultDays) {
        LocalDate today = LocalDate.now(ZONE);
        LocalDate start, end;
        if (notBlank(from) && notBlank(to)) {
            start = LocalDate.parse(from, DATE_FMT);
            end   = LocalDate.parse(to, DATE_FMT);
        } else {
            end = today;
            start = today.minusDays(defaultDays - 1);
        }
        if (end.isBefore(start)) { LocalDate t = start; start = end; end = t; }
        return new LocalDate[]{start, end};
    }

    public static long windowDays(LocalDate s, LocalDate e) {
        return Duration.between(s.atStartOfDay(), e.plusDays(1).atStartOfDay()).toDays();
    }

    /** Trả ISO_LOCAL_DATE_TIME (ví dụ: 2025-10-20T07:55:58.231947100) */
    public static String iso(LocalDateTime ldt) {
        return (ldt == null) ? null : ISO_LDT.format(ldt);
    }

    public static Double pctDelta(Number prev, Number curr) {
        double p = prev == null ? 0.0 : prev.doubleValue();
        double c = curr == null ? 0.0 : curr.doubleValue();
        if (p == 0.0) return (c == 0.0) ? 0.0 : 1.0;
        return (c - p) / p;
    }

    public static long nz(Long v) { return v != null ? v : 0L; }
    public static String nz(String s) { return s != null ? s : ""; }
    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }
}
