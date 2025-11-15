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

export type StatusFilter = "all" | BookStatus;

type RemoteBook = {
  title: string;
  author: string | null;
};

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  // ----------------------------------------
  // Load từ SQLite
  // ----------------------------------------
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
        setError(
          e?.message || "Có lỗi khi tải danh sách sách."
        );
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

  // ----------------------------------------
  // Thêm sách
  // ----------------------------------------
  const addBook = useCallback(
    async (title: string, author?: string | null) => {
      const newBook = await insertBook(
        title,
        author ?? null,
        "planning"
      );
      setBooks((prev) => [newBook, ...prev]);
    },
    []
  );

  // ----------------------------------------
  // Sửa sách
  // ----------------------------------------
  const editBook = useCallback(
    async (
      id: number,
      title: string,
      author: string | null,
      status: BookStatus
    ) => {
      await updateBook(id, title, author, status);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, title, author, status } : b
        )
      );
    },
    []
  );

  // ----------------------------------------
  // Chu kỳ status
  // ----------------------------------------
  const cycleStatus = useCallback(
    (current: BookStatus): BookStatus => {
      if (current === "planning") return "reading";
      if (current === "reading") return "done";
      return "planning";
    },
    []
  );

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

  // ----------------------------------------
  // Xóa sách
  // ----------------------------------------
  const removeBook = useCallback(async (id: number) => {
    await deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // ----------------------------------------
  // Search + Filter (useMemo)
  // ----------------------------------------
  const visibleBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return books.filter((b) => {
      const matchSearch =
        q.length === 0
          ? true
          : b.title.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all"
          ? true
          : b.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [books, searchQuery, statusFilter]);

  // ----------------------------------------
  // Import từ API MockAPI — Câu 9
  // ----------------------------------------
  const importFromApi = useCallback(async () => {
    try {
      setImporting(true);
      setError(null);

      // Gọi API từ MockAPI
      const res = await fetch(
        "https://68e6175321dd31f22cc41c7a.mockapi.io/books"
      );

      if (!res.ok) {
        throw new Error("Không gọi được API từ MockAPI");
      }

      const data: any[] = await res.json();

      // Map API -> RemoteBook type
      const remoteBooks: RemoteBook[] = data.map(
        (item: any) => ({
          title: String(item.title || "").trim(),
          author: item.author
            ? String(item.author).trim()
            : null,
        })
      );

      // Tránh trùng title
      const existing = new Set(
        books.map((b) => b.title.trim().toLowerCase())
      );

      const toInsert: RemoteBook[] = remoteBooks.filter(
        (rb: RemoteBook) => {
          if (!rb.title) return false;

          const key = rb.title.toLowerCase();
          if (existing.has(key)) return false;

          existing.add(key);
          return true;
        }
      );

      // Insert vào SQLite với status = planning
      const inserted = await Promise.all(
        toInsert.map((rb: RemoteBook) =>
          insertBook(rb.title, rb.author, "planning")
        )
      );

      // Update state
      setBooks((prev) => [...inserted, ...prev]);
    } catch (e: any) {
      console.log("Import error:", e);
      setError(e?.message || "Lỗi khi import sách từ API");
    } finally {
      setImporting(false);
    }
  }, [books]);

  // ----------------------------------------
  // Trả về API cho UI sử dụng
  // ----------------------------------------
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
