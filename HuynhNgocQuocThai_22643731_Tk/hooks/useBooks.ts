// hooks/useBooks.ts
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Book,
  BookStatus,
  fetchBooks,
  insertBook,
  updateBookStatus,
  deleteBook,
  updateBook,
} from "../db";

type RemoteBook = {
  title: string;
  author?: string | null;
};

export type StatusFilter = "all" | BookStatus;

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  /** Load từ SQLite */
  const loadBooks = useCallback(
    async (opts?: { refreshing?: boolean }) => {
      try {
        if (opts?.refreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);
        const data = await fetchBooks();
        setBooks(data);
      } catch (e: any) {
        console.log("Error loadBooks:", e);
        setError(e?.message || "Có lỗi khi tải danh sách sách.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const reload = useCallback(
    () => loadBooks({ refreshing: true }),
    [loadBooks]
  );

  /** Thêm sách mới */
  const addBook = useCallback(
    async (title: string, author?: string | null) => {
      const newBook = await insertBook(title, author ?? null, "planning");
      setBooks((prev) => [newBook, ...prev]);
    },
    []
  );

  /** Sửa sách */
  const editBook = useCallback(
    async (id: number, title: string, author: string | null, status: BookStatus) => {
      await updateBook(id, title, author, status);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, title, author, status } : b
        )
      );
    },
    []
  );

  /** Chu kỳ status planning → reading → done → planning */
  const cycleStatus = useCallback((current: BookStatus): BookStatus => {
    if (current === "planning") return "reading";
    if (current === "reading") return "done";
    return "planning";
  }, []);

  const toggleStatus = useCallback(
    async (id: number) => {
      const target = books.find((b) => b.id === id);
      if (!target) return;
      const newStatus = cycleStatus(target.status);
      await updateBookStatus(id, newStatus);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: newStatus } : b
        )
      );
    },
    [books, cycleStatus]
  );

  /** Xóa sách */
  const removeBook = useCallback(async (id: number) => {
    await deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  /** Search + filter */
  const visibleBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return books.filter((b) => {
      const matchSearch = !q
        ? true
        : b.title.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ? true : b.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [books, searchQuery, statusFilter]);

  /** Import từ API – Câu 9 dùng, để đây luôn */
  const importFromApi = useCallback(async () => {
    try {
      setImporting(true);
      setError(null);

      // Ví dụ dùng Gutendex books API (có title + authors)
      const res = await fetch(
        "https://gutendex.com/books/?page=1&page_size=10"
      );
      if (!res.ok) {
        throw new Error("Không gọi được API sách");
      }

      const json = await res.json();
      const data: any[] = json.results || [];

      const remoteBooks: RemoteBook[] = data.map((item) => ({
        title: String(item.title || "").trim(),
        author:
          Array.isArray(item.authors) && item.authors.length > 0
            ? item.authors[0].name
            : null,
      }));

      // tránh trùng title
      const existing = new Set(
        books.map((b) => b.title.trim().toLowerCase())
      );

      const toInsert = remoteBooks.filter((rb) => {
        if (!rb.title) return false;
        const key = rb.title.toLowerCase();
        if (existing.has(key)) return false;
        existing.add(key);
        return true;
      });

      const inserted = await Promise.all(
        toInsert.map((rb) => insertBook(rb.title, rb.author ?? null, "planning"))
      );

      setBooks((prev) => [...inserted, ...prev]);
    } catch (e: any) {
      console.log("Error importFromApi:", e);
      setError(e?.message || "Lỗi khi import sách gợi ý.");
    } finally {
      setImporting(false);
    }
  }, [books]);

  return {
    books,
    visibleBooks,
    loading,
    refreshing,
    importing,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    reload,
    addBook,
    editBook,
    toggleStatus,
    removeBook,
    importFromApi,
  };
}
