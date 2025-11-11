import React, { useState, useEffect } from 'react'
import { View, Button, Text, Vibration } from 'react-native'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as Speech from 'expo-speech'

export default function VoiceRecorder({ onFileReady, prompt }) {
  const [recording, setRecording] = useState(null)
  const [uri, setUri] = useState(null)

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync()
      }
    }
  }, [recording])

  async function start() {
    await Audio.requestPermissionsAsync()
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
    const rec = new Audio.Recording()
    await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
    await rec.startAsync()
    setRecording(rec)
    Vibration.vibrate(200)
    Speech.speak(prompt)
  }

  async function stop() {
    if (!recording) return
    await recording.stopAndUnloadAsync()
    const fileUri = recording.getURI()
    const dest = FileSystem.documentDirectory + `voice_${Date.now()}.wav`
    await FileSystem.copyAsync({ from: fileUri, to: dest })
    setUri(dest)
    setRecording(null)
    onFileReady(dest)
    Vibration.vibrate([0,100,50,100])
  }

  return (
    <View>
      <Button title={recording ? '停止录音' : '开始语音'} onPress={recording ? stop : start}/>
      <Text>{uri || '未录音'}</Text>
    </View>
  )
}