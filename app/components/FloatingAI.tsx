import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const FloatingChat = () => {
  const { user } = useAuthStore();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{text: string; isUser: boolean}[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const animValue = useRef(new Animated.Value(0)).current;
  const height = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_HEIGHT * 0.4], // Chat height when expanded
  });
  const width = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH * 0.8], // Chat width when expanded
  });
  const borderRadius = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });
  const contentOpacity = animValue.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
  });
  const iconScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0], // Icon scales down when chat expands
  });

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (isExpanded && messages.length === 0 && user?.full_name) {
      const welcomeMessage = `Hi ${user.full_name.split(' ')[0]}, how can I help?`;
      setMessages([{ text: welcomeMessage, isUser: false }]);
      speak(welcomeMessage);
    }
  }, [isExpanded]);

  const speak = (text: string) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  };

  const stopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setUserInput('');
    stopSpeech();

    setIsLoading(true);
    setTimeout(scrollToBottom, 100);

    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDeKkgEp9JC9nMvTquLIcj1n3X1mQr_9NA',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }],
          }),
        }
      );

      const data = await res.json();
      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\*/g, "") || 'Sorry, I could not understand.';
      
      setMessages(prev => [...prev, { text: aiReply, isUser: false }]);
      setTimeout(scrollToBottom, 100);
      speak(aiReply);
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Sorry, there was an error.', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Floating icon with no background */}
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <TouchableOpacity 
          onPress={() => setIsExpanded(true)}
          activeOpacity={0.8}
          style={styles.floatingButton}
        >
          <Image 
            source={require('../../assets/robotc.png')} 
            style={styles.botIcon}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Chat container that expands from nothing */}
      <Animated.View style={[
        styles.chatContainer,
        { 
          height,
          width,
          borderRadius,
          opacity: contentOpacity,
          backgroundColor: '#2271B1',
        }
      ]}>
        <View style={styles.chatContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>AI Assistant</Text>
            <TouchableOpacity onPress={() => setIsExpanded(false)}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((msg, i) => (
              <View key={i} style={[
                styles.messageBubble,
                msg.isUser ? styles.userBubble : styles.aiBubble
              ]}>
                {!msg.isUser && (
                  <Image 
                    source={require('../../assets/robotc.png')} 
                    style={styles.smallBotIcon}
                  />
                )}
                <Text style={styles.messageText}>
                  {msg.text}
                </Text>
              </View>
            ))}
            
            {isLoading && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={userInput}
              onChangeText={setUserInput}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend}>
              <Feather name="send" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  floatingButton: {
    // No background styles - just the image
  },
  botIcon: {
    width: 40,
    height: 40,
  },
  smallBotIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  chatContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  chatContent: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageBubble: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 10,
    marginVertical: 4,
    maxWidth: SCREEN_WIDTH * 0.7, // Limit bubble width to 70% of screen width
    flexWrap: 'wrap', // Allow text to wrap within the bubble
    overflow: 'hidden', // Prevent overflow of text beyond the bubble's bounds
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2271B1',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  messageText: {
    fontSize: 14,
    color: 'white',
    flexWrap: 'wrap', // Ensure text wraps in the message bubble
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 4,
  },
});


export default FloatingChat;