import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Button } from 'react-native'

export default function Notifications() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/notifications').then(r => r.json()).then(d => setItems(d))
  }, [])

  return (
    <View style={{ padding:20 }}>
      <Text style={{ fontSize:18 }}>系统通知</Text>
      <FlatList data={items} keyExtractor={i => i.id.toString()} renderItem={({ item }) => (
        <View style={{ padding:10, borderBottomWidth:1 }}>
          <Text>{item.message}</Text>
        </View>
      )} />
    </View>
  )
}