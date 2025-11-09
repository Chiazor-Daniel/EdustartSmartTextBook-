import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (!user) {
    return (
        <View style={styles.container}>
          <Text style={styles.signInText}>Please sign in to view your profile</Text>
        </View>
    );
  }

  return (
    <ScrollView style={styles.container}>


        {/* User Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editIcon}
              onPress={() => {
                // Handle edit profile
              }}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>User Type</Text>
              <Text style={styles.infoValue}>
                {user.user_type === 'organization' ? 'Organization' : 'Individual'}
              </Text>
            </View>
            
            {user.organization && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Organization</Text>
                <Text style={styles.infoValue}>{user.organization.name}</Text>
              </View>
            )}
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>May 2024</Text>
            </View>
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#94a3b8" />
            <Text style={styles.optionText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="help-circle-outline" size={20} color="#94a3b8" />
            <Text style={styles.optionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  signInText: {
    color: '#1E293B',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#1E293B',
    fontSize: 20,
    fontWeight: '600',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    color: '#1E293B',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  email: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 24,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '500',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionText: {
    flex: 1,
    color: '#1E293B',
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: 'red',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 'auto',
    width: '50%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
