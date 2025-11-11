import React, { useState } from 'react'
import { View, Text, Button, ActivityIndicator } from 'react-native'
import VoiceRecorder from './VoiceRecorder'
import ConfirmationModal from './ConfirmationModal'
import { uploadVoiceFile, confirmCommand, fetchNotifications } from '../services/api'
import * as Speech from 'expo-speech'

export default function TransactionScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [lastMessage, setLastMessage] = useState('')
  const [pendingCommand, setPendingCommand] = useState(null)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [notifications, setNotifications] = useState([])

  async function onFileReady(fileUri) {
    setLoading(true)
    setLastMessage('处理中')
    const res = await uploadVoiceFile(fileUri)
    setLoading(false)
    if (res.error) {
      setLastMessage(res.error)
      Speech.speak(res.error)
      return
    }
    if (res.require_confirmation) {
      setPendingCommand(res.command)
      setConfirmVisible(true)
      Speech.speak(res.prompt)
    } else {
      setLastMessage(res.message)
      Speech.speak(res.message)
    }
  }

  async function onConfirm() {
    setConfirmVisible(false)
    setLoading(true)
    const res = await confirmCommand(pendingCommand)
    setLoading(false)
    setPendingCommand(null)
    setLastMessage(res.message)
    Speech.speak(res.message)
  }

  async function onCancel() {
    setConfirmVisible(false)
    setPendingCommand(null)
    setLastMessage('操作已取消')
    Speech.speak('操作已取消')
  }

  async function loadNotifications() {
    const data = await fetchNotifications()
    setNotifications(data)
  }

  return (
    <View style={{ padding:20 }}>
      <Text style={{ fontSize:20 }}>银发助手 交易界面</Text>
      <VoiceRecorder onFileReady={onFileReady} prompt="请说出您的指令 比如 给儿子转五百元"/>
      {loading && <ActivityIndicator size="large" />}
      <Text>{lastMessage}</Text>
      <Button title="查看通知" onPress={() => { navigation.navigate('Notifications') }} />
      <Button title="家庭守护" onPress={() => { navigation.navigate('Guardians') }} />
      <Button title="加载通知" onPress={loadNotifications} />
      <ConfirmationModal visible={confirmVisible} command={pendingCommand} onConfirm={onConfirm} onCancel={onCancel}/>
    </View>
  )
}