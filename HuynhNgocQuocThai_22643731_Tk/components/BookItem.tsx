// components/BookItem.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { Book } from "../db";

type Props = {
  book: Book;
  onPress: () => void;   // chạm đổi status
  onEdit: () => void;
  onDelete: () => void;
};

const BookItem: React.FC<Props> = ({
  book,
  onPress,
  onEdit,
  onDelete,
}) => {
  const statusColor =
    book.status === "planning"
      ? "#0d6efd"
      : book.status === "reading"
      ? "#fd7e14"
      : "#198754";

  const statusLabel =
    book.status === "planning"
      ? "Planning"
      : book.status === "reading"
      ? "Reading"
      : "Done";

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.info}>
        <Text style={styles.title}>{book.title}</Text>
        {book.author ? (
          <Text style={styles.author}>{book.author}</Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor },
          ]}
        >
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.link} onPress={onEdit}>
            Sửa
          </Text>
          <Text style={styles.linkDelete} onPress={onDelete}>
            Xóa
          </Text>
        </View>
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
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  author: {
    fontSize: 14,
    color: "#555",
  },
  right: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  link: {
    fontSize: 12,
    color: "#0d6efd",
  },
  linkDelete: {
    fontSize: 12,
    color: "#c82333",
  },
});
