import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

const BottomNavigation = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: 'home',
      route: '/(tabs)/home',
      label: 'Dashboard',
    },
    {
      name: 'Study',
      icon: 'book-open',
      route: '/(tabs)/subjects-list',
      label: 'Study',
    },
    {
      name: 'Join Class',
      icon: 'video',
      route: '/(tabs)/join-class',
      label: 'Join Class',
    },
    {
      name: 'Settings',
      icon: 'settings',
      route: '/(tabs)/profile',
      label: 'Settings',
    },
  ];

  const isActiveRoute = (route: string) => {
    if (route === '/(tabs)/subjects-list') {
      return pathname.includes('/subjects-list') || pathname.includes('/subjects');
    }
    return pathname === route || pathname.startsWith(route);
  };

  const handleNavigation = (route: string) => {
    if (pathname !== route) {
      router.push(route);
    }
  };
  

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navigationContainer}>
          {navigationItems.map((item, index) => {
            const isActive = isActiveRoute(item.route);

            return (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => handleNavigation(item.route)}
                activeOpacity={0.6}
              >
                <View style={styles.navContent}>
                  <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                    <Feather
                      name={item.icon}
                      size={isActive ? 24 : 22}
                      color={isActive ? '#6B8AF7' : '#9CA3AF'}
                    />
                  </View>
                  <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                    {item.label}
                  </Text>
                </View>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
    height: 75,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    // height: 75,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },
  navContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: '#EEF4FF',
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  activeNavLabel: {
    color: '#6B8AF7',
    fontWeight: '600',
    fontSize: 12,
  },
  activeIndicator: {
    position: 'absolute',
    top: 2,
    width: 28,
    height: 3,
    backgroundColor: '#6B8AF7',
    borderRadius: 2,
    shadowColor: '#6B8AF7',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default BottomNavigation;
