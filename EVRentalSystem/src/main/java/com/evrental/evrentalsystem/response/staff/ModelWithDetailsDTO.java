package com.evrental.evrentalsystem.response.staff;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelWithDetailsDTO {
    private VehicleModelDTO model;
    private List<VehicleDetailDTO> details;
}