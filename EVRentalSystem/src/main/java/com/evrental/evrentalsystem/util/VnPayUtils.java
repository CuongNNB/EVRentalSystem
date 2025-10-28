package com.evrental.evrentalsystem.util;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class VnPayUtils {

    public static String hmacSHA512(String key, String data) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac.init(secretKey);
        byte[] hashBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(2 * hashBytes.length);
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b & 0xff));
        }
        return sb.toString();
    }

    // Build query string encoding keys & values (used for both hashData and redirect query)
    public static String buildQueryString(Map<String, String> params) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (String k : keys) {
            String v = params.get(k);
            if (v == null || v.length() == 0) continue;
            if (!first) sb.append('&');
            sb.append(URLEncoder.encode(k, StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(v, StandardCharsets.UTF_8));
            first = false;
        }
        return sb.toString();
    }
}
