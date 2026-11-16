package com.example.library.book;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The "is it allowed, given what exists?" rules live in the service, so we test them here. */
class BookServiceTest {

    private BookService service;

    @BeforeEach
    void setUp() {
        service = new BookService(new FakeBookRepository());
    }

    @Test
    void theSameBookCannotBeCreatedTwice() {
        service.create(new BookRequest("Dune", "Frank Herbert", 1965));

        assertThrows(DuplicateBookException.class,
                () -> service.create(new BookRequest("Dune", "Frank Herbert", 1965)));
    }

    @Test
    void aDifferentYearIsADifferentBook() {
        service.create(new BookRequest("Dune", "Frank Herbert", 1965));

        assertDoesNotThrow(() -> service.create(new BookRequest("Dune", "Frank Herbert", 1966)));
        assertEquals(2, service.findAll().size());
    }

    @Test
    void aDifferentCaseIsADifferentBookBecauseTheRuleIsExact() {
        service.create(new BookRequest("Dune", "Frank Herbert", 1965));

        assertDoesNotThrow(() -> service.create(new BookRequest("dune", "Frank Herbert", 1965)));
    }

    @Test
    void updatingABookToMatchAnotherBookIsRejected() {
        service.create(new BookRequest("Dune", "Frank Herbert", 1965));
        Book other = service.create(new BookRequest("Emma", "Jane Austen", 1815));

        assertThrows(DuplicateBookException.class,
                () -> service.update(other.id(), new BookRequest("Dune", "Frank Herbert", 1965)));
    }

    @Test
    void aBookIsNeverADuplicateOfItself() {
        Book dune = service.create(new BookRequest("Dune", "Frank Herbert", 1965));

        assertDoesNotThrow(() -> service.update(dune.id(), new BookRequest("Dune", "Frank Herbert", 1965)));
    }

    @Test
    void updatingAMissingBookIsNotFoundNotDuplicate() {
        assertThrows(BookNotFoundException.class,
                () -> service.update(UUID.randomUUID(), new BookRequest("Dune", "Frank Herbert", 1965)));
    }
}
