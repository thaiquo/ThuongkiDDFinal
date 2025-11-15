// screens/BookListScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Button,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { useBooks } from "../hooks/useBooks";
import BookItem from "../components/BookItem";
import BookModal from "../components/BookModal";
import type { Book } from "../db";

const BookListScreen: React.FC = () => {
  const {
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
  } = useBooks();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const openAddModal = () => {
    setEditingBook(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSubmitModal = async (title: string, author: string | null) => {
    if (editingBook) {
      // chỉnh sửa – sẽ xử lý ở Câu 6
      await editBook(editingBook.id, title, author, editingBook.status);
    } else {
      // thêm mới
      await addBook(title, author);
    }
    closeModal();
  };

  const handleDeleteWithConfirm = (id: number) => {
    Alert.alert(
      "Xóa sách",
      "Bạn có chắc chắn muốn xóa sách này?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => removeBook(id),
        },
      ]
    );
  };

  const isBusy = loading || importing;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading List</Text>

      {/* Search (Câu 8) */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm theo tiêu đề..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filter theo status (Câu 8) */}
      <View style={styles.filterRow}>
        {["all", "planning", "reading", "done"].map((st) => (
          <Button
            key={st}
            title={
              st === "all"
                ? "Tất cả"
                : st === "planning"
                ? "Planning"
                : st === "reading"
                ? "Reading"
                : "Done"
            }
            onPress={() => setStatusFilter(st as any)}
            color={
              statusFilter === st ? "#0d6efd" : "#adb5bd"
            }
          />
        ))}
      </View>

      {/* Nút thêm + import + reload */}
      <View style={styles.topRow}>
        <Button
          title="Thêm sách"
          onPress={openAddModal}
          disabled={isBusy}
        />
        <Button
          title={importing ? "Đang import..." : "Import từ API"}
          onPress={importFromApi}
          disabled={importing}
        />
        <Button
          title="Tải lại"
          onPress={reload}
          disabled={loading}
        />
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {error && !loading && (
        <Text style={styles.errorText}>Lỗi: {error}</Text>
      )}

      {!loading && visibleBooks.length === 0 && !error && (
        <Text style={styles.emptyText}>
          Chưa có sách trong danh sách đọc.
        </Text>
      )}

      {!loading && visibleBooks.length > 0 && (
        <FlatList
          data={visibleBooks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={reload}
            />
          }
          renderItem={({ item }) => (
            <BookItem
              book={item}
              onPress={() => toggleStatus(item.id)} // Câu 5
              onEdit={() => {
                setEditingBook(item);
                setModalVisible(true);
              }}
              onDelete={() =>
                handleDeleteWithConfirm(item.id)
              }
            />
          )}
        />
      )}

      <BookModal
        visible={modalVisible}
        heading={
          editingBook ? "Sửa sách" : "Thêm sách mới"
        }
        initialTitle={editingBook?.title}
        initialAuthor={editingBook?.author}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </View>
  );
};

export default BookListScreen;

// Styles giữ nguyên như trước, chỉ thêm chút:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  center: {
    marginTop: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#c82333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 16,
    textAlign: "center",
    color: "#666",
  },
  list: {
    paddingTop: 8,
    paddingBottom: 16,
  },
});
