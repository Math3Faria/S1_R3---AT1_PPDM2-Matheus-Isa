import React from "react"
import {Text} from "react-native"
import {NavigationContainer} from "@react-navigation/native"
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs"

import HomeScreen from "./screens/HomeScreen"
import ExploreScreen from "./screens/ExploreScreen"
import FavoritesScreen from "./screens/FavoriteScreen"

const Tab=createBottomTabNavigator()

export default function App(){
  return(
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown:false,
          tabBarStyle:{
            backgroundColor:"#11152A",
            borderTopColor:"#252A42",
            height:70,
            paddingTop:8,
            paddingBottom:8
          },
          tabBarActiveTintColor:"#FFFFFF",
          tabBarInactiveTintColor:"#747B92",
          tabBarLabelStyle:{
            fontSize:12,
            fontWeight:"600"
          }
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel:"Home",
            tabBarIcon:()=>(
              <Text style={{fontSize:22}}>🌌</Text>
            )
          }}
        />

        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            tabBarLabel:"Explorar",
            tabBarIcon:()=>(
              <Text style={{fontSize:22}}>🔭</Text>
            )
          }}
        />

        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            tabBarLabel:"Favoritos",
            tabBarIcon:({color})=>(
              <Text style={{fontSize:25,color}}>♥</Text>
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}