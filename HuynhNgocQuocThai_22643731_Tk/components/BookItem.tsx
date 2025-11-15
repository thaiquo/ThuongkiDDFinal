// components/BookItem.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { Book } from "../db";

type Props = {
  book: Book;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const BookItem: React.FC<Props> = ({
  book,
  onPress,
  onEdit,
  onDelete,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.info}>
        <Text style={styles.title}>{book.title}</Text>
        {book.author ? (
          <Text style={styles.author}>{book.author}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Text style={styles.status}>{book.status}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default BookItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    elevation: 1,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  author: {
    fontSize: 14,
    color: "#555",
  },
  actions: {},
  status: {
    fontSize: 12,
    color: "#333",
  },
});
