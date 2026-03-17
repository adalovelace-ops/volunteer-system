import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";
import TabNavigator from "./TabNavigator";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ProjectDetail: { projectId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}