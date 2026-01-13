import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { AppProvider } from "../contexte/AppContext";
import { initDatabase } from "../services/database";

export default function RootLayout() {

  useEffect(() => {
    // Initialize Database on App Launch
    const setupDB = async () => {
      try {
        await initDatabase();
        console.log("SQLite DB Initialized");
      } catch (e) {
        console.error("Failed to init SQLite DB", e);
      }
    };
    setupDB();
  }, []);

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