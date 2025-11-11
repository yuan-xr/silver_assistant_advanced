import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Button } from 'react-native'

export default function GuardianPanel() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/guardian_alerts').then(r => r.json()).then(d => setAlerts(d))
  }, [])

  async function approve(alert) {
    await fetch('http://localhost:5000/guardian_action', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ alert_id: alert.id, action: 'approve' })
    })
    const d = await fetch('http://localhost:5000/guardian_alerts').then(r => r.json())
    setAlerts(d)
  }

  async function reject(alert) {
    await fetch('http://localhost:5000/guardian_action', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ alert_id: alert.id, action: 'reject' })
    })
    const d = await fetch('http://localhost:5000/guardian_alerts').then(r => r.json())
    setAlerts(d)
  }

  return (
    <View style={{ padding:20 }}>
      <Text style={{ fontSize:18 }}>守护者面板</Text>
      <FlatList data={alerts} keyExtractor={i => i.id.toString()} renderItem={({ item }) => (
        <View style={{ padding:10, borderBottomWidth:1 }}>
          <Text>{item.message}</Text>
          <Button title="批准" onPress={() => approve(item)} />
          <Button title="拒绝" onPress={() => reject(item)} />
        </View>
      )} />
    </View>
  )
}