// The same four fields as the Java record in Week 4: Book(UUID id, String title, String author, int year).
// A UUID travels as a string in JSON, so id is a string here.
// Plain TypeScript: nothing Angular about it.
export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
}
