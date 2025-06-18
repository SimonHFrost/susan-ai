import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import { SkiaAnimation } from 'components/SkiaAnimation';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

console.log('ELEVEN_LABS_KEY:', process.env.ELEVEN_LABS_KEY);

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenContent title="Susan" path="App.tsx">
          <SkiaAnimation />
        </ScreenContent>
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
