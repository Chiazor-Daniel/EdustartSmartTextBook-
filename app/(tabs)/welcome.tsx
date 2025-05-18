import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Feather, FontAwesome } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import Header from '../components/Header';
import LinearBg from '../components/LinearBg';
import { useAuthStore } from '@/store/authStore';

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const { user } = useAuthStore();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string, isUser: boolean }>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in when component mounts
    scale.value = withTiming(1, { duration: 300 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  useEffect(() => {
    // Use the user's name from Zustand
    if (user?.full_name) {
      Speech.speak(`Ask me a question i'm here to help you`);
    }
  }, [user?.full_name]);

  const botAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const stopSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Stop any ongoing speech when user sends a message
    stopSpeech();

    const userMessage = userInput.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setUserInput('');

    // Scroll to bottom with user's message
    setTimeout(scrollToBottom, 100);

    // Show loading indicator for AI response
    setIsLoading(true);

    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDeKkgEp9JC9nMvTquLIcj1n3X1mQr_9NA',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${userMessage}` }] }],
          }),
        }
      );

      const data = await res.json();
      setIsLoading(false);

      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\*/g, "") || 'Sorry, I could not understand.';
      setMessages(prev => [...prev, { text: aiReply, isUser: false }]);

      // Scroll to bottom with AI's response
      setTimeout(scrollToBottom, 100);

      setIsSpeaking(true);
      Speech.speak(aiReply, {
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setMessages(prev => [...prev, { text: 'Sorry, there was an error.', isUser: false }]);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <View style={styles.content}>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Hello {user?.full_name}. Ready to continue learning?
        </Text>
      </View>

      {/* Robot image centered in the screen */}
      <Animated.View style={[styles.botContainer, botAnimatedStyle]}>
        <Image source={require('../../assets/robotw.png')} style={styles.botImage} />
      </Animated.View>

      {/* Chat container positioned above the input field */}
      <View style={styles.chatContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatBox}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageRow,
                msg.isUser ? styles.userRow : styles.aiRow
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.isUser ? styles.userBubble : styles.aiBubble
                ]}
              >
                {!msg.isUser && (
                  <View style={styles.robotIconContainer}>
                    <Image source={require('../../assets/robotc.png')} style={styles.botIcon} />
                  </View>
                )}
                <Text style={[styles.messageText, msg.isUser ? styles.userText : styles.aiText]}>
                  {msg.text}
                </Text>
                {msg.isUser && (
                  <View style={styles.userIconContainer}>
                    <FontAwesome name="user" size={14} color="#fff" />
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Loading indicator while waiting for AI response */}
          {isLoading && (
            <View style={styles.messageRow}>
              <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
                <View style={styles.robotIconContainer}>
                  <Image source={require('../../assets/robotc.png')} style={styles.botIcon} />
                </View>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Input container fixed at the bottom */}
      <View style={styles.inputWrapper}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="What can I do for you today?"
            placeholderTextColor="#666"
            value={userInput}
            onChangeText={setUserInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Feather name="send" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Stop speech button */}
        {isSpeaking && (
          <TouchableOpacity style={styles.stopSpeechButton} onPress={stopSpeech}>
            <Feather name="volume-x" size={20} color="white" />
            <Text style={styles.stopSpeechText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  botContainer: {
    width: 150,
    height: 150,
    // borderRadius: 75,
    // backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  botImage: {
    transform: [{ scale: 1 }],
  },
  chatContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.0)', // Transparent background
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    maxHeight: '40%',
  },
  chatBox: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 10,
  },
  messageRow: {
    width: '100%',
    flexDirection: 'row',
    marginVertical: 5,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 10,

    // Remove maxWidth to allow bubble to fit content
  },
  userBubble: {
    backgroundColor: 'rgba(34, 113, 177, 0.8)', // Slightly transparent blue
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(72, 72, 72, 0.75)', // Slightly transparent dark gray
    borderTopLeftRadius: 4,
    flex: 1,
    paddingRight: 20

  },
  messageContent: {
    flex: 1, // Allow text content to take available space
    flexShrink: 1, // Enable content to shrink if needed
  },
  loadingBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
  },
  messageText: {
    fontSize: 15,
    marginHorizontal: 8,
  },
  userText: {
    color: 'white',
    textAlign: 'right',
  },
  aiText: {
    color: 'white',
  },
  robotIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 15,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  stopSpeechButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  stopSpeechText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  botIcon: {
    width: 24,
    height: 24,
  },
});

