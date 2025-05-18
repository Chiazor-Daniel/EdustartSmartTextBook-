import { View, StyleSheet } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

const LinearBg = ({children}: {children: React.ReactNode}) => {
  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'transparent']}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  )
}

export default LinearBg

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
})  