import {NavigationContainer} from "@react-navigation/native"
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs"
import {Text} from "react-native"

import HomeScreen from "./screens/HomeScreen"

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#11152A",
            borderTopColor: "#252A42",
            height: 70,
            paddingTop: 8,
            paddingBottom: 8
          },
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "#747B92",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600"
          }
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({color}) => (
              <Text style={{fontSize: 22, color}}>🌌</Text>
            )
          }}
        />

      </Tab.Navigator>
    </NavigationContainer>
  )
}