package com.example.library.book;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookRepository {

    List<Book> findAll();

    Optional<Book> findById(UUID id);

    /** Inserts the book, or replaces the existing one with the same id. */
    Book save(Book book);

    void deleteById(UUID id);
}
