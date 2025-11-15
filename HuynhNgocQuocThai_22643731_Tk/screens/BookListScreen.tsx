// screens/BookListScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useBooks } from "../hooks/useBooks";
import BookItem from "../components/BookItem";

const BookListScreen: React.FC = () => {
  const {
    visibleBooks,
    loading,
    error,
  } = useBooks();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading List</Text>

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
          renderItem={({ item }) => (
            <BookItem
              book={item}
              onPress={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          )}
        />
      )}
    </View>
  );
};

export default BookListScreen;

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
    marginBottom: 12,
    textAlign: "center",
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
