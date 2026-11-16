package com.example.library.book;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** The same title, author and year already exist. Same style as BookNotFoundException. */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateBookException extends RuntimeException {

    public DuplicateBookException(String title, String author, int year) {
        super("Book already exists: " + title + " by " + author + " (" + year + ")");
    }
}
