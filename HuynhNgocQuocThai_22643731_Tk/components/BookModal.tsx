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

type Props = {
  visible: boolean;
  heading?: string;
  initialTitle?: string;
  initialAuthor?: string | null;
  onClose: () => void;
  onSubmit: (title: string, author: string | null) => void;
};

const BookModal: React.FC<Props> = ({
  visible,
  heading,
  initialTitle = "",
  initialAuthor = "",
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor ?? "");

  useEffect(() => {
    setTitle(initialTitle);
    setAuthor(initialAuthor ?? "");
  }, [initialTitle, initialAuthor, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Tiêu đề sách không được để trống");
      return;
    }
    onSubmit(title.trim(), author.trim() || null);
    setTitle("");
    setAuthor("");
  };

  const handleClose = () => {
    setTitle("");
    setAuthor("");
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

            <TextInput
              style={styles.input}
              placeholder="Tiêu đề sách *"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Tác giả (tuỳ chọn)"
              value={author}
              onChangeText={setAuthor}
            />

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
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
