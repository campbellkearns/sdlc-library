# City Library Catalogue: Business Requirements Specification (excerpt)

Version 0.3, class excerpt for Week 6 Monday. The City Library is fictional.

## 1. Purpose of This Document

This document sets out what the City Library needs from a catalogue app. It describes **what** the app must let people do, not **how** it should be built. Turning it into stories, tasks and code is the delivery team's job.

## 2. Business Background

The library's catalogue lives in a spreadsheet that only one librarian can edit at a time. Readers cannot see what the library holds without visiting or phoning. Librarians enter 20 to 30 new books a week between other duties, and the same mistakes keep turning up: a blank author, an impossible year, the same book entered twice.

## 3. Business Objectives

1. Readers can see the whole catalogue from home.
2. Librarians keep the catalogue accurate with less effort.
3. There is one shared catalogue, not copies that drift apart.

## 4. Scope

**4.1 In scope for this phase:** seeing the catalogue; adding a book; removing a book.

**4.2 Out of scope for this phase:** loans, members, search, editing a book, sign-in.

## 5. Stakeholders

The Head Librarian (owner of this document), the librarians, the readers, and the council's IT team.

## 6. User Personas

**"Rosa, librarian."** Adds new books in short bursts between helping readers. Wants to type a book in once and trust that it is saved. Is annoyed when she finds a book entered twice, and has no patience for error messages she has to decode.

**"Sam, reader."** Checks from home whether the library has a book before making the trip.

## 7. Business Requirements: How to Read This Section

Each requirement has a reference and a priority: **Must** (the app does not meet the objectives without it), **Should** (expected; its absence must be justified), **Could** (desirable if time allows). Requirements state the outcome the business needs, not the technology.

## 8. Business Requirements

| Ref | Requirement | Priority |
|---|---|---|
| BR‑01 | A reader must be able to see every book in the catalogue, with its title, author and year. | Must |
| BR‑02 | A librarian must be able to add a new book to the catalogue. | Must |
| BR‑03 | Every book must have a title, an author and a year of publication. A title or author made only of spaces does not count. | Must |
| BR‑04 | A title or an author may be up to 200 characters long. The year must be from 1 to 2100. | Must |
| BR‑05 | The catalogue must never hold the same book twice. Two books are the same when the title, the author and the year all match. | Must |
| BR‑06 | A book added by one librarian must be visible to everyone, straight away and after the app is closed and opened again. | Must |
| BR‑07 | A librarian should be able to remove a book from the catalogue. | Should |
| BR‑08 | Only librarians should be able to change the catalogue. Readers can only look. | Should (next phase) |

## 9. Service Expectations

**9.1 Usability.** A librarian should know at once whether a book was saved, and if it was not, why, in plain words.

**9.2 Trust.** What the screen shows is what the catalogue holds.

## 10. Assumptions and Constraints

The Library service built in Week 4 is the system of record. It already refuses a book that breaks BR-03, BR-04 or BR-05. The catalogue app runs in a web browser.

## 11. Success Criteria

A librarian can add a book in under a minute, and no incomplete or duplicate book reaches the catalogue.
