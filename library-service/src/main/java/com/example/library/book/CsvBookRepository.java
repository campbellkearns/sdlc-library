package com.example.library.book;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

/** The only class that knows about files. */
@Repository
public class CsvBookRepository implements BookRepository {

    private static final String HEADER = "id,title,author,year";
    private static final String QUOTE = "\"";

    private final Path file;

    public CsvBookRepository(@Value("${library.csv.path}") String path) {
        this.file = Path.of(path);
        initFile();
    }

    @Override
    public synchronized List<Book> findAll() {
        return readAll();
    }

    @Override
    public synchronized Optional<Book> findById(UUID id) {
        return readAll().stream()
                .filter(book -> book.id().equals(id))
                .findFirst();
    }

    @Override
    public synchronized Book save(Book book) {
        List<Book> books = readAll();
        boolean replaced = false;
        for (int i = 0; i < books.size(); i++) {
            if (books.get(i).id().equals(book.id())) {
                books.set(i, book);
                replaced = true;
                break;
            }
        }
        if (!replaced) {
            books.add(book);
        }
        writeAll(books);
        return book;
    }

    @Override
    public synchronized void deleteById(UUID id) {
        List<Book> books = readAll();
        if (books.removeIf(book -> book.id().equals(id))) {
            writeAll(books);
        }
    }

    // ---- file handling ----

    private void initFile() {
        try {
            if (file.getParent() != null) {
                Files.createDirectories(file.getParent());
            }
            if (Files.notExists(file)) {
                Files.writeString(file, HEADER + System.lineSeparator());
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot initialise " + file, e);
        }
    }

    private List<Book> readAll() {
        try (Stream<String> lines = Files.lines(file)) {
            return lines.skip(1)
                    .filter(line -> !line.isBlank())
                    .map(CsvBookRepository::fromCsv)
                    .collect(Collectors.toCollection(ArrayList::new));
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot read " + file, e);
        }
    }

    private void writeAll(List<Book> books) {
        List<String> lines = new ArrayList<>();
        lines.add(HEADER);
        books.forEach(book -> lines.add(toCsv(book)));
        Path temp = file.resolveSibling(file.getFileName() + ".tmp");
        try {
            Files.write(temp, lines);
            Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot write " + file, e);
        }
    }

    // ---- CSV encoding ----

    private static String toCsv(Book book) {
        return String.join(",",
                book.id().toString(),
                escape(book.title()),
                escape(book.author()),
                String.valueOf(book.year()));
    }

    private static String escape(String value) {
        String text = value == null ? "" : value.replace('\n', ' ').replace('\r', ' ');
        if (text.contains(",") || text.contains(QUOTE)) {
            return QUOTE + text.replace(QUOTE, QUOTE + QUOTE) + QUOTE;
        }
        return text;
    }

    private static Book fromCsv(String line) {
        List<String> f = splitCsvLine(line);
        return new Book(UUID.fromString(f.get(0)), f.get(1), f.get(2), Integer.parseInt(f.get(3)));
    }

    private static List<String> splitCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        current.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current.append(c);
                }
            } else if (c == '"') {
                inQuotes = true;
            } else if (c == ',') {
                fields.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString());
        return fields;
    }
}
