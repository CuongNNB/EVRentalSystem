package com.evrental.evrentalsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;  // <— PHẢI có import này

@SpringBootApplication(scanBasePackages = "com.evrental.evrentalsystem")
public class EvRentalSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvRentalSystemApplication.class, args);
    }
}
