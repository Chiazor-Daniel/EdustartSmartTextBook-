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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={toggleSidebar}
        >
          <Feather name="menu" size={24} color="#2C3E50" />
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.profileButton}
          onPress={toggleActionOverlay}
        >
          <View style={styles.profileIcon}>
            <Feather name="user" size={18} color="#2C3E50" />
          </View>
          <Feather name="chevron-down" size={16} color="#2C3E50" />
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
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: '#2C3E50',
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
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
});

export default Header;
