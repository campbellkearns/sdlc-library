package com.example.library.book;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/** Tests the rules on BookRequest with no Spring, no web server, no curl. */
class BookRequestTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeFactory() {
        factory.close();
    }

    @Test
    void aFullyValidRequestHasNoViolations() {
        Set<ConstraintViolation<BookRequest>> violations =
                validator.validate(new BookRequest("Dune", "Frank Herbert", 1965));

        assertTrue(violations.isEmpty());
    }

    @Test
    void aBlankTitleIsRejected() {
        Set<ConstraintViolation<BookRequest>> violations =
                validator.validate(new BookRequest("   ", "Frank Herbert", 1965));

        assertEquals(1, violations.size());
        assertEquals("title", violations.iterator().next().getPropertyPath().toString());
    }

    @Test
    void aMissingAuthorIsRejected() {
        Set<ConstraintViolation<BookRequest>> violations =
                validator.validate(new BookRequest("Dune", null, 1965));

        assertEquals(1, violations.size());
        assertEquals("author", violations.iterator().next().getPropertyPath().toString());
    }

    @Test
    void aTitleOf201CharactersIsRejectedButExactly200IsFine() {
        String max = "x".repeat(200);

        assertTrue(validator.validate(new BookRequest(max, "A", 2000)).isEmpty());
        assertEquals(1, validator.validate(new BookRequest(max + "x", "A", 2000)).size());
    }

    @Test
    void yearsOutsideOneToTwoThousandOneHundredAreRejected() {
        assertEquals(1, validator.validate(new BookRequest("Dune", "Frank Herbert", 0)).size());
        assertEquals(1, validator.validate(new BookRequest("Dune", "Frank Herbert", -5)).size());
        assertEquals(1, validator.validate(new BookRequest("Dune", "Frank Herbert", 2101)).size());
        assertTrue(validator.validate(new BookRequest("Dune", "Frank Herbert", 2100)).isEmpty());
    }

    @Test
    void everyBrokenRuleIsReportedNotJustTheFirst() {
        Set<ConstraintViolation<BookRequest>> violations =
                validator.validate(new BookRequest("", "", 0));

        assertEquals(3, violations.size());
    }
}
