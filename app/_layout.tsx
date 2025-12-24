import { Stack } from "expo-router";
import React from "react";
import { AppProvider } from "../contexte/AppContext";

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </AppProvider>
  );
}