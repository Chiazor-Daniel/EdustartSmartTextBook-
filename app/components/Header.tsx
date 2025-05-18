import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUIStore } from '@/store/uiStore';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleActionOverlay: () => void;
}

const Header = ({ toggleSidebar, toggleActionOverlay }: HeaderProps) => {
  // Get header visibility state from UI store
  const isHeaderVisible = useUIStore(state => state.isHeaderVisible);
  
  // Don't render the header if it's not visible
  if (!isHeaderVisible) return null;
  
  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={toggleSidebar}
        >
          <Feather name="menu" size={24} color="white" />
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.profileButton}
          onPress={toggleActionOverlay}
        >
          <View style={styles.profileIcon}>
            <Feather name="user" size={18} color="white" />
          </View>
          <Feather name="chevron-down" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45, // Standard status bar height
    paddingBottom: 15,
    backgroundColor: 'transparent',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
});

export default Header;
