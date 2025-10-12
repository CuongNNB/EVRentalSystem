package com.evrental.evrentalsystem.response.staff;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class BookingsInStationResponse {
    public Integer id;
    public String customerName;
    public String customerNumber;
    public Integer vehicleModelId;
    public String vehicleModel;
    public LocalDateTime startDate;
    public LocalDateTime endDate;
    public String status;
    public double totalAmount;

}
