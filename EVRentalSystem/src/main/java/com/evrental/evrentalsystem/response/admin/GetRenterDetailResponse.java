package com.evrental.evrentalsystem.response.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetRenterDetailResponse {
    private Integer renterId;
    private String verificationStatus;
    private Boolean isRisky;
    private String cccdFrontUrl;
    private String cccdBackUrl;
    private String driverLicenseUrl;
}
