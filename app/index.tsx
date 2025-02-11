//eas build --profile development --platform android
//Index.tsx
import { Redirect } from "expo-router";

function Index() {
  console.log(
    "Index: Launching app in mode:",
    process.env.EXPO_PUBLIC_CURRENT_APP_MODE
  );

  if (process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "prod") {
    console.log = function no_console() {};
    console.error = function no_console() {};
    console.warn = function no_console() {};
    console.debug = function no_console() {};
  }

  return <Redirect href="../(tabs)/HomeScreen" />;
}

export default Index;
