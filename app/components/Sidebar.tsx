import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  Platform 
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.7;

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

const Sidebar = ({ isVisible, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [mounted, setMounted] = React.useState(false);
  const { logout } = useAuthStore();
  
  React.useEffect(() => {
    if (isVisible) {
      setMounted(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Only unmount after animation completes
        setMounted(false);
      });
    }
  }, [isVisible, translateX]);

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const menuItems = [
   
    { 
      icon: 'bar-chart', 
      label: 'Dashboard', 
      path: '/performance',
      component: Feather 
    },
    { 
      icon: 'book', 
      label: 'Study', 
      path: '/subjects-list',
      component: MaterialIcons 
    },
    { 
      icon: 'file-text', 
      label: 'Take a test', 
      path: '/assessment-notification',
      component: Feather 
    },
    { 
      icon: 'users', 
      label: 'Join a class', 
      path: '/join-class',
      component: Feather 
    },
    { 
      icon: 'user', 
      label: 'Profile', 
      path: '/profile',
      component: Feather 
    },
    { 
      icon: 'chat', 
      label: 'Talk to an AI Tutor', 
      path: '/welcome',
      component: MaterialIcons 
    }
    
   
  ];

  if (!mounted && !isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateX }],
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999, // Ensure it's on top
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      />
      <View style={styles.sidebar}>
        <View style={styles.menuItems}>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            const IconComponent = item.component || Feather;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  isActive && styles.activeMenuItem
                ]}
                onPress={() => navigateTo(item.path)}
              >
                <IconComponent 
                  name={item.icon} 
                  size={20} 
                  color={isActive ? "#fff" : "#CBD5E1"} 
                />
                <Text 
                  style={[
                    styles.menuItemText,
                    isActive && styles.activeMenuItemText
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: 'Logout',
                  onPress: () => {
                    onClose();
                    logout();
                    router.replace('/(auth)/login');
                  },
                  style: 'destructive'
                }
              ]
            );
          }}
        >
          <Feather name="log-out" size={20} color="#CBD5E1" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Animated.View> 
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,  // Makes sure the sidebar is on top
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#1E293B',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    gap: 10,
    borderRightColor: '#334155',
  },
  menuItems: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  activeMenuItem: {
    backgroundColor: '#3B82F6',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#CBD5E1',
  },
  activeMenuItemText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#CBD5E1',
  },
});

export default Sidebar;
