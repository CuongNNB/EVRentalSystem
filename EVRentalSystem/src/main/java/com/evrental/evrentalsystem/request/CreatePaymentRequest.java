package com.evrental.evrentalsystem.request;

import lombok.Data;

@Data
public class CreatePaymentRequest {
    private Long amount; // amount in VND (e.g. 10000 for 10k VND)
    private String orderInfo;
    private String orderId; // optional, if null server will create one
    private String locale; // "vn" or "en"
}