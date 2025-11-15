// components/BookModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import type { BookStatus } from "../db";

type Props = {
  visible: boolean;
  heading?: string;
  initialTitle?: string;
  initialAuthor?: string | null;
  initialStatus?: BookStatus;
  showStatusPicker?: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    author: string | null,
    status?: BookStatus
  ) => void;
};

const BookModal: React.FC<Props> = ({
  visible,
  heading,
  initialTitle = "",
  initialAuthor = "",
  initialStatus = "planning",
  showStatusPicker = false,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor ?? "");
  const [status, setStatus] = useState<BookStatus>(initialStatus);

  // Khi mở modal → load lại giá trị ban đầu
  useEffect(() => {
    setTitle(initialTitle);
    setAuthor(initialAuthor ?? "");
    setStatus(initialStatus);
  }, [initialTitle, initialAuthor, initialStatus, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Tiêu đề sách không được để trống");
      return;
    }

    onSubmit(title.trim(), author.trim() || null, status);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>
              {heading ?? "Thêm sách mới"}
            </Text>

            {/* input title */}
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề sách *"
              value={title}
              onChangeText={setTitle}
            />

            {/* input author */}
            <TextInput
              style={styles.input}
              placeholder="Tác giả (tuỳ chọn)"
              value={author}
              onChangeText={setAuthor}
            />

            {/* Chọn trạng thái (chỉ khi sửa) */}
            {showStatusPicker && (
              <View style={styles.statusRow}>
                {(["planning", "reading", "done"] as BookStatus[]).map(
                  (s) => (
                    <Text
                      key={s}
                      style={[
                        styles.statusChip,
                        status === s && styles.statusChipActive,
                      ]}
                      onPress={() => setStatus(s)}
                    >
                      {s === "planning"
                        ? "Planning"
                        : s === "reading"
                        ? "Reading"
                        : "Done"}
                    </Text>
                  )
                )}
              </View>
            )}

            {/* actions */}
            <View style={styles.actions}>
              <Button title="Huỷ" onPress={handleClose} />
              <Button title="Lưu" onPress={handleSave} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BookModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusChip: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 6,
    marginHorizontal: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 12,
  },
  statusChipActive: {
    backgroundColor: "#0d6efd",
    color: "#fff",
    borderColor: "#0d6efd",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
