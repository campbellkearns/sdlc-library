package com.example.library.book;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * What a client sends to create or update a book. No id: the server chooses it.
 * The rules below are the ones written on the board in Module 6, beat 1.
 */
public record BookRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 200) String author,
        @Min(1) @Max(2100) int year
) {
}
