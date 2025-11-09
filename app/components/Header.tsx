import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUIStore } from '@/store/uiStore';
import { Image } from 'expo-image';
import { router } from 'expo-router';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleActionOverlay: () => void;
}

const Header = ({ toggleSidebar, toggleActionOverlay }: HeaderProps) => {
  const isHeaderVisible = useUIStore(state => state.isHeaderVisible);

  if (!isHeaderVisible) return null;

  return (
        <View style={styles.header}>
          <Image source={require("../../assets/logo-1-png.png")} style={{ width: 150, height: 150 }} />

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.profileIcon}>
              <Feather name="user" size={18} color="#2C3E50" />
            </View>
            {/* <Feather name="chevron-down" size={16} color="#2C3E50" /> */}
          </TouchableOpacity>
        </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 65,
    marginBottom: 10,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
});

export default Header;
