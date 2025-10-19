package com.evrental.evrentalsystem.enums;

public enum Enum {
    Allowed_distance_per_hour(20),
    Cost_per_kWh(3000)
    ;

    private final int value;
    Enum(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
