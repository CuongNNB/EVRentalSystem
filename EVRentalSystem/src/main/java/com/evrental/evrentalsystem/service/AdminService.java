package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final StationRepository stationRepository;
    //Hàm lấy tổng số xe tại 1 trạm cho admin.


    //End code here
}
