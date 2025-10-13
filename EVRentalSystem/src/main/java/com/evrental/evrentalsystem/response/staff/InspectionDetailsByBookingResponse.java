package com.evrental.evrentalsystem.response.staff;

import com.evrental.evrentalsystem.enums.PartCarName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InspectionDetailsByBookingResponse {
    PartCarName partName;
    String pic;
    String desc;
}
