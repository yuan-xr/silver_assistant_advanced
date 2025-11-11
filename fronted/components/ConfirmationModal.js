import React from 'react'
import { Modal, View, Text, Button, Vibration } from 'react-native'
import * as Speech from 'expo-speech'

export default function ConfirmationModal({ visible, command, onConfirm, onCancel }) {
  function confirm() {
    Vibration.vibrate(300)
    Speech.speak('已确认')
    onConfirm()
  }

  function cancel() {
    Vibration.vibrate([0,100,200])
    Speech.speak('已取消')
    onCancel()
  }

  return (
    <Modal visible={visible} transparent={true}>
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' }}>
        <View style={{ width:'90%', backgroundColor:'#fff', padding:20, borderRadius:8 }}>
          <Text>请确认以下操作</Text>
          <Text>{command ? JSON.stringify(command) : '无操作'}</Text>
          <Button title="确认" onPress={confirm}/>
          <Button title="取消" onPress={cancel}/>
        </View>
      </View>
    </Modal>
  )
}