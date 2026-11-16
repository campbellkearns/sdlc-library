# library-service

The Library service from Week 4 (Spring Boot, JDK 21). Books are stored in `data/books.csv`. It answers 400 for a blank title or author, a title or author over 200 characters, or a year outside 1 to 2100, and 409 for a book that is already in the catalogue. The lab instructions are in the [README at the top of the repo](../README.md).

```bash
cp data/books.seed.csv data/books.csv   # the first time, and to reset (service stopped)
mvn spring-boot:run                     # http://localhost:8080/api/books
mvn test                                # the service's own unit tests
```
