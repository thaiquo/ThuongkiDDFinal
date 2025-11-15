// App.tsx (Q4 -> Q11)
import React from "react";
import {
  
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookListScreen from "./screens/BookListScreen";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <BookListScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
});
