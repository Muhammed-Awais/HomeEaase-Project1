import { Redirect } from "expo-router";

export default function Index() {
  // Mock auth check — always redirect to auth for now
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
