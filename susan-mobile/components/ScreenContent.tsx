import { Text, View, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react-native';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
};

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

// Configuration for different development environments
const getApiBaseUrl = () => {
  // For iOS simulator and Android emulator, use the host machine's IP
  // Replace with your actual IP address from ifconfig
  const LOCAL_IP = '172.16.3.103';
  
  // For physical devices on the same network, use the same IP
  // For web/desktop development, you might use localhost
  return `http://${LOCAL_IP}:11434`;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Susan, your pocket therapist. How have you been feeling today?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userPrompt = inputText.trim();
    setInputText('');

    // Create initial bot message with loading state
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, initialBotMessage]);

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${getApiBaseUrl()}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'susan',
          prompt: userPrompt,
        }),
        signal: controller.signal,
      });

      // Clear timeout if request succeeds
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to get the response as text first (React Native fallback)
      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error('Empty response from server');
      }

      // Process the response text line by line
      const lines = responseText.split('\n').filter(line => line.trim());
      let accumulatedText = '';
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            accumulatedText += data.response;
          }
        } catch (e) {
          // Skip invalid JSON lines
          console.warn('Failed to parse JSON line:', line);
        }
      }

      // Update the bot message with the complete accumulated text
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: accumulatedText || 'I received your message but had trouble processing it. Please try again.', isLoading: false }
          : msg
      ));

    } catch (error) {
      console.error('Error calling local model:', error);
      let errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMessage = 'Unable to connect to Susan. Make sure the server is running and accessible.';
        } else if (error.name === 'AbortError') {
          errorMessage = 'Response timed out. Susan might be thinking too hard! Please try again.';
        } else if (error.message.includes('Failed to get response reader')) {
          errorMessage = 'Connection issue with Susan. Please try sending your message again.';
        }
      }
      
      // Update with error message
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: errorMessage, isLoading: false }
          : msg
      ));
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header with Susan animation - hide when keyboard is visible */}
      {!isKeyboardVisible && (
        <View className="items-center justify-center pb-4">
          <Text className="mb-4 text-2xl font-bold text-gray-800">{title}</Text>
          {children}
        </View>
      )}

      {/* Chat Display Area */}
      <View className="flex-1 mx-4 mb-4">
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-4">
            {messages.map((message) => (
              <View
                key={message.id}
                className={`mb-3 flex-row ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <View
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-500 rounded-br-md'
                      : 'bg-gray-200 rounded-bl-md'
                  }`}
                >
                  {message.isLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#3B82F6" />
                      <Text className="ml-2 text-gray-600">Hmm...</Text>
                    </View>
                  ) : (
                    <Text
                      className={`text-base ${
                        message.isUser ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {message.text}
                    </Text>
                  )}
                  <Text
                    className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Text Input Area */}
        <View className="mt-4">
          <View className="relative">
            <TextInput
              className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-l-lg pr-14 rounded-r-3xl"
              placeholder="What's on your mind?"
              placeholderTextColor="#6B7280"
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={Platform.OS === 'ios' ? 1 : 4}
              maxLength={500}
              onSubmitEditing={sendMessage}
              returnKeyType={Platform.OS === 'ios' ? 'send' : 'default'}
              enablesReturnKeyAutomatically={Platform.OS === 'ios'}
              blurOnSubmit={Platform.OS === 'ios'}
            />
            <TouchableOpacity
              onPress={sendMessage}
              className="absolute items-center justify-center p-2 -translate-y-1/2 bg-blue-500 rounded-full right-2 top-1/2"
              disabled={inputText.trim() === ''}
            >
              <Send color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
