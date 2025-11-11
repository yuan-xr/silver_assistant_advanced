import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import TransactionScreen from './components/TransactionScreen'
import Notifications from './components/Notifications'
import GuardianPanel from './components/GuardianPanel'

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Transaction">
        <Stack.Screen name="Transaction" component={TransactionScreen}/>
        <Stack.Screen name="Notifications" component={Notifications}/>
        <Stack.Screen name="Guardians" component={GuardianPanel}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}