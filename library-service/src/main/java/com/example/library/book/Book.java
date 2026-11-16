package com.example.library.book;

import java.util.UUID;

/** A book as the library stores and returns it. */
public record Book(UUID id, String title, String author, int year) {
}
