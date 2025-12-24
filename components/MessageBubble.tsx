import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
from: "user" | "assistant";
text: string;
}

export default function MessageBubble({ from, text }: Props) {
const isUser = from === "user";
return (
<View
style={[
styles.container,
isUser ? styles.userContainer : styles.assistantContainer,
]}
>
<Text style={isUser ? styles.userText : styles.assistantText}>{text} </Text>
</View>
);
}

const styles = StyleSheet.create({
container: {
padding: 10,
marginVertical: 4,
maxWidth: "80%",
borderRadius: 12,
},
userContainer: {
alignSelf: "flex-end",
backgroundColor: "#2563EB",
},
assistantContainer: {
alignSelf: "flex-start",
backgroundColor: "#E5E7EB",
},
userText: {
color: "white",
},
assistantText: {
color: "#111827",
},
});

