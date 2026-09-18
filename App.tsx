import {NavigationContainer} from "@react-navigation/native"
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs"
import {Text} from "react-native"

import ExploreScreen from "./screens/ExploreScreen"
import FavoritesScreen from "./screens/FavoriteScreen"
import React from "react"

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
          name="Explore"
          component={ExploreScreen}
          options={{
            tabBarLabel: "Explorar",
            tabBarIcon: ({color}) => (
              <Text style={{fontSize: 22, color}}>🔭</Text>
            )
          }}
        />

        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarLabel: "Favoritos",
            tabBarIcon: ({color}) => (
              <Text style={{fontSize: 22, color}}>♥</Text>
            )
          }}
        />

      </Tab.Navigator>
    </NavigationContainer>
  )
}