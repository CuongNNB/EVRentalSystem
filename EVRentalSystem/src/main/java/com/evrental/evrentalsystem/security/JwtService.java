package com.evrental.evrentalsystem.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.security.Key;

@Service
public class JwtService {

    // 👇 Bí mật này dùng để ký JWT. Đổi thành chuỗi ngẫu nhiên dài (ít nhất 32 ký tự)
    private static final String SECRET_KEY = "your-secret-key-for-evrental-2025-1234567890";

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // ✅ Sinh token JWT
    public String generateToken(Map<String, Object> extraClaims, String subject) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24h
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Sinh token đơn giản (chỉ cần username/email)
    public String generateToken(String subject) {
        return generateToken(new HashMap<>(), subject);
    }

    // ✅ Lấy username/email từ token
    public String extractSubject(String token) {
        return extractAllClaims(token).getSubject();
    }

    // ✅ Kiểm tra token hợp lệ
    public boolean isTokenValid(String token, String username) {
        final String extractedSubject = extractSubject(token);
        return (extractedSubject.equals(username) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}


// hehehhhsdsđ
