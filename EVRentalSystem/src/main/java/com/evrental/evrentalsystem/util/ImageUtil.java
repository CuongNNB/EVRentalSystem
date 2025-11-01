package com.evrental.evrentalsystem.util;

import org.springframework.http.*;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

/**
 * Utility cho xử lý ảnh lưu dưới dạng base64.
 * - decodeBase64: loại bỏ prefix "data:...;base64," nếu có và decode.
 * - detectImageMimeType: nhận diện png/jpg/gif bằng magic bytes.
 * - buildImageResponse: tạo ResponseEntity<byte[]> với header phù hợp.
 */
public class ImageUtil {

    public static byte[] decodeBase64(String base64) {
        if (base64 == null || base64.trim().isEmpty()) return null;
        String raw = base64;
        if (base64.startsWith("data:")) {
            int comma = base64.indexOf(',');
            if (comma > -1) raw = base64.substring(comma + 1);
        }
        try {
            return Base64.getDecoder().decode(raw);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    public static String detectImageMimeType(byte[] data) {
        if (data == null || data.length < 4) return "application/octet-stream";

        // JPEG: FF D8
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8) return "image/jpeg";

        // PNG: 89 50 4E 47
        if ((data[0] & 0xFF) == 0x89 && (data[1] & 0xFF) == 0x50 &&
                (data[2] & 0xFF) == 0x4E && (data[3] & 0xFF) == 0x47) return "image/png";

        // GIF: 47 49 46 38
        if ((data[0] & 0xFF) == 0x47 && (data[1] & 0xFF) == 0x49 &&
                (data[2] & 0xFF) == 0x46 && (data[3] & 0xFF) == 0x38) return "image/gif";

        return "application/octet-stream";
    }

    public static ResponseEntity<byte[]> buildImageResponse(byte[] bytes, String mimeType) {
        if (bytes == null || bytes.length == 0) {
            return ResponseEntity.notFound().build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(mimeType));
        headers.setContentLength(bytes.length);
        headers.setCacheControl(CacheControl.maxAge(3600, TimeUnit.SECONDS).cachePublic());
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
