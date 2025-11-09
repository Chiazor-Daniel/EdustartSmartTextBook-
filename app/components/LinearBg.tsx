import { View, StyleSheet } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

const LinearBg = ({children, auth}: {children: React.ReactNode, auth?: boolean}) => {
  return !auth ? (
    <View
      style={[{backgroundColor: '#fff'}, styles.container]}
    >
      {children}
    </View>
  ) : (
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'transparent']}
      style={[styles.container, {backgroundColor: '#1E293B'}]}
    >
      {children}
    </LinearGradient>
  )
}

export default LinearBg

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
