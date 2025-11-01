package com.evrental.evrentalsystem.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {
    private Integer bookingId;
    private Integer rating;
    private String comment;
}
