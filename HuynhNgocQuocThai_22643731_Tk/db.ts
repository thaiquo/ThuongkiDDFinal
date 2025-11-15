// db.ts
import * as SQLite from "expo-sqlite";

/** Kiểu Book dùng chung toàn app */
export type BookStatus = "planning" | "reading" | "done";

export type Book = {
  id: number;
  title: string;
  author: string | null;
  status: BookStatus;
  createdAt: number;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Mở DB + tạo bảng + seed lần đầu */
async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("reading_list.db");

      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          author TEXT,
          status TEXT DEFAULT 'planning',
          created_at INTEGER
        );
      `);

      // Seed nếu bảng trống
      const row = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM books"
      );
      if (!row || row.count === 0) {
        const now = Date.now();
        await db.runAsync(
          "INSERT INTO books (title, author, status, created_at) VALUES (?, ?, ?, ?)",
          ["Clean Code", "Robert C. Martin", "planning", now]
        );
        await db.runAsync(
          "INSERT INTO books (title, author, status, created_at) VALUES (?, ?, ?, ?)",
          ["Atomic Habits", "James Clear", "reading", now]
        );
      }

      return db;
    })();
  }
  return dbPromise;
}

/** Lấy tất cả books */
export async function fetchBooks(): Promise<Book[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    title: string;
    author: string | null;
    status: string;
    created_at: number | null;
  }>("SELECT * FROM books ORDER BY created_at DESC, id DESC");

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    author: r.author,
    status: (r.status as BookStatus) ?? "planning",
    createdAt: r.created_at ?? Date.now(),
  }));
}

/** Thêm sách mới */
export async function insertBook(
  title: string,
  author?: string | null,
  status: BookStatus = "planning"
): Promise<Book> {
  const db = await getDb();
  const now = Date.now();

  const result = (await db.runAsync(
    "INSERT INTO books (title, author, status, created_at) VALUES (?, ?, ?, ?)",
    [title, author ?? null, status, now]
  )) as any;

  const id = result.lastInsertRowId as number;

  return {
    id,
    title,
    author: author ?? null,
    status,
    createdAt: now,
  };
}

/** Cập nhật status */
export async function updateBookStatus(
  id: number,
  status: BookStatus
): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE books SET status = ? WHERE id = ?", [status, id]);
}

/** Cập nhật title + author + status */
export async function updateBook(
  id: number,
  title: string,
  author: string | null,
  status: BookStatus
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE books SET title = ?, author = ?, status = ? WHERE id = ?",
    [title, author, status, id]
  );
}

/** Xóa sách */
export async function deleteBook(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM books WHERE id = ?", [id]);
}
