package com.example.library.book;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class BookService {

    private final BookRepository repository;

    public BookService(BookRepository repository) {
        this.repository = repository;
    }

    public List<Book> findAll() {
        return repository.findAll();
    }

    public Book get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new BookNotFoundException(id));
    }

    public Book create(BookRequest request) {
        rejectDuplicate(request, null);
        Book book = new Book(UUID.randomUUID(), request.title(), request.author(), request.year());
        return repository.save(book);
    }

    public Book update(UUID id, BookRequest request) {
        get(id); // throws 404 if the book doesn't exist
        rejectDuplicate(request, id);
        return repository.save(new Book(id, request.title(), request.author(), request.year()));
    }

    public void delete(UUID id) {
        get(id); // throws 404 if the book doesn't exist
        repository.deleteById(id);
    }

    /**
     * The "same book" rule: same title, author AND year, compared exactly.
     * It needs the OTHER books, so it cannot be an annotation on the request.
     * It is check-then-save, so two simultaneous requests can both pass:
     * Module 7's database constraint is what really enforces it.
     * The book being updated (excludedId) is never a duplicate of itself.
     */
    private void rejectDuplicate(BookRequest request, UUID excludedId) {
        boolean exists = repository.findAll().stream()
                .filter(book -> !book.id().equals(excludedId))
                .anyMatch(book -> book.title().equals(request.title())
                        && book.author().equals(request.author())
                        && book.year() == request.year());
        if (exists) {
            throw new DuplicateBookException(request.title(), request.author(), request.year());
        }
    }
}
