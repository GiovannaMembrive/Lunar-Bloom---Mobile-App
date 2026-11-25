import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { Fraunces_700Bold, Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { StoreProvider } from './src/store';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import MyListScreen from './src/screens/MyListScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import { C, shadow } from './src/theme';
import { RootStack } from './src/types';

const Stack = createNativeStackNavigator<RootStack>();
const Tab = createBottomTabNavigator();

const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Início: ['ice-cream', 'ice-cream-outline'],
  Buscar: ['search', 'search-outline'],
  'Minha lista': ['heart', 'heart-outline'],
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: C.ink,
        tabBarInactiveTintColor: C.muted,
        tabBarActiveBackgroundColor: C.matchaSoft,
        tabBarLabelStyle: { fontFamily: 'Nunito_700Bold', fontSize: 11 },
        tabBarItemStyle: { borderRadius: 28, marginHorizontal: 4, marginVertical: 2 },
        tabBarStyle: {
          position: 'absolute', left: 16, right: 16, bottom: 16, height: 68, paddingTop: 4, paddingBottom: 4,
          borderRadius: 34, backgroundColor: C.paper, borderTopWidth: 0, ...shadow,
        },
        tabBarIcon: ({ focused, color }) => (
          <Ionicons name={icons[route.name][focused ? 0 : 1]} size={22} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Buscar" component={SearchScreen} />
      <Tab.Screen name="Minha lista" component={MyListScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
    Fraunces_700Bold, Fraunces_900Black,
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.matcha} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: C.bg } }}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Details" component={DetailsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}