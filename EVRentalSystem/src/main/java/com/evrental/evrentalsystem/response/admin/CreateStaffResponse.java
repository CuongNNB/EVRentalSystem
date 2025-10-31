package com.evrental.evrentalsystem.response.admin;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStaffResponse {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String position;
    private String status;
    private Integer stationId;
    private String stationName;
    private LocalDateTime createdAt;
}
