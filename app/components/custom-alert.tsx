import { useEffect, useState } from "react";
import { Animated, Modal, TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Dimensions } from "react-native";

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export const CustomAlert = ({ visible, title, message, type, onClose, onConfirm }: any) => {
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getIconName = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'alert-circle';
      default: return 'info';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.alertContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.alertContent}>
            <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
              <Feather name={getIconName()} size={24} color={getIconColor()} />
            </View>
            
            <Text style={styles.alertTitle}>{title}</Text>
            <Text style={styles.alertMessage}>{message}</Text>
            
            <View style={styles.alertButtons}>
              {onConfirm ? (
                <>
                  <TouchableOpacity 
                    style={[styles.alertButton, styles.cancelButton]} 
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.alertButton, styles.confirmButton]} 
                    onPress={onConfirm}
                  >
                    <Text style={styles.confirmButtonText}>OK</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={[styles.alertButton, styles.singleButton]} 
                  onPress={onClose}
                >
                  <Text style={styles.singleButtonText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({

  // Custom Alert Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 0,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },
  alertContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  singleButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  singleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
}); 