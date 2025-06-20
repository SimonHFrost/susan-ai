import { Text, View, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react-native';
import { generateResponse } from '../data/api';

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
// This has been moved to susan-mobile/data/api.ts

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
      const botResponseText = await generateResponse(userPrompt);

      // Update the bot message with the complete accumulated text
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: botResponseText, isLoading: false }
          : msg
      ));

    } catch (error) {
      console.error('Error calling local model:', error);
      let errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
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
        <View className="justify-center items-center pb-4">
          <Text className="mb-4 text-2xl font-bold text-gray-800">{title}</Text>
          {children}
        </View>
      )}

      {/* Chat Display Area */}
      <View className="flex-1 mx-4 mb-4">
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm"
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
              className="px-4 py-3 pr-14 w-full text-base bg-white rounded-r-3xl rounded-l-lg border border-gray-200"
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
              className="absolute right-2 top-1/2 justify-center items-center p-2 bg-blue-500 rounded-full -translate-y-1/2"
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
