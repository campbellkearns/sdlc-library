package com.example.library.book;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** A plain in-memory BookRepository for tests: no file, no Spring. */
class FakeBookRepository implements BookRepository {

    private final Map<UUID, Book> books = new LinkedHashMap<>();

    @Override
    public List<Book> findAll() {
        return new ArrayList<>(books.values());
    }

    @Override
    public Optional<Book> findById(UUID id) {
        return Optional.ofNullable(books.get(id));
    }

    @Override
    public Book save(Book book) {
        books.put(book.id(), book);
        return book;
    }

    @Override
    public void deleteById(UUID id) {
        books.remove(id);
    }
}
