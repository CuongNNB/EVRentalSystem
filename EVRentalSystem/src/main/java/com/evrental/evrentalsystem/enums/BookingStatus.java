    package com.evrental.evrentalsystem.enums;

    public enum BookingStatus {
        Pending_Deposit_Payment, //1
        Pending_Deposit_Confirmation, //2
        Pending_Contract_Signing, //3
        Pending_Vehicle_Pickup, //4
        Vehicle_Inspected_Before_Pickup, //5
        Currently_Renting, //6
        Vehicle_Returned, //7
        Vehicle_Inspected_After_Pickup, //8
        Pending_Total_Payment, //9
        Pending_Total_Payment_Confirmation, //10
        Completed, //11
        Cancelled, //12
    }
