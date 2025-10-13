package com.evrental.evrentalsystem.response.staff;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RenterDetailsByBookingResponse {
    String fullName;
    String phoneNumber;
    String email;
    String gplx;
    String frontCccd;
    String backCccd;
}
