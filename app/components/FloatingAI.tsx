import { useAuthStore } from '@/store/authStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;

const FloatingChat = () => {
  const { user } = useAuthStore();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{text: string; isUser: boolean; id: string}[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const animValue = useRef(new Animated.Value(0)).current;
  const height = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isLandscape ? SCREEN_HEIGHT * 0.9 : SCREEN_HEIGHT * 0.4],
  });
  const width = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH * 0.8],
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
    outputRange: [1, 0],
  });

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (isExpanded && messages.length === 0 && user?.full_name) {
      const welcomeMessage = `Hi ${user.full_name.split(' ')[0]}, how can I help?`;
      const messageId = Date.now().toString();
      setMessages([{ text: welcomeMessage, isUser: false, id: messageId }]);
      if (!isMuted) {
        speak(welcomeMessage, messageId);
      }
    }

    // Stop speech when chat is closed
    if (!isExpanded) {
      stopSpeech();
    }
  }, [isExpanded]);

  const speak = (text: string, messageId: string) => {
    if (isMuted) return;
    
    setIsSpeaking(true);
    setSpeakingMessageId(messageId);
    Speech.speak(text, {
      onDone: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      },
      onStopped: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      },
    });
  };

  const stopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isSpeaking) {
      stopSpeech();
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    const messageId = Date.now().toString();
    setMessages(prev => [...prev, { text: userMessage, isUser: true, id: messageId }]);
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
      const aiMessageId = Date.now().toString();
      
      setMessages(prev => [...prev, { text: aiReply, isUser: false, id: aiMessageId }]);
      setTimeout(scrollToBottom, 100);
      if (!isMuted) {
        speak(aiReply, aiMessageId);
      }
    } catch (err) {
      const errorMessageId = Date.now().toString();
      setMessages(prev => [...prev, { text: 'Sorry, there was an error.', isUser: false, id: errorMessageId }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[
      styles.outerContainer,
      isLandscape
        ? { left: 20, right: undefined, alignItems: 'flex-start' }
        : { right: 20, left: undefined, alignItems: 'flex-end' }
    ]}>
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
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={toggleMute} style={styles.headerButton}>
                <Ionicons 
                  name={isMuted ? "volume-mute" : "volume-high"} 
                  size={20} 
                  color="white" 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsExpanded(false)} style={styles.headerButton}>
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((msg) => (
              <View key={msg.id} style={[
                styles.messageBubble,
                msg.isUser ? styles.userBubble : styles.aiBubble
              ]}>
                {!msg.isUser && (
                  <View style={styles.messageHeader}>
                    <Image 
                      source={require('../../assets/robotc.png')} 
                      style={styles.smallBotIcon}
                    />
                    {!msg.isUser && (
                      <TouchableOpacity 
                        onPress={() => speak(msg.text, msg.id)}
                        style={styles.speakButton}
                      >
                        <Ionicons 
                          name={speakingMessageId === msg.id ? "pause" : "play"} 
                          size={16} 
                          color="white" 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
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
    zIndex: 9999,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
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
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  speakButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});


export default FloatingChat;