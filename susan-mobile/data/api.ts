// susan-mobile/data/api.ts

// Configuration for different development environments
const getApiBaseUrl = () => {
  // For iOS simulator and Android emulator, use the host machine's IP
  // You may need to replace this with your actual local IP address
  const LOCAL_IP = '172.16.3.103';
  
  // For physical devices on the same network, use the same IP
  // For web/desktop development, you might use localhost
  return `http://${LOCAL_IP}:11434`;
};

export const generateResponse = async (prompt: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'susan',
        prompt: prompt,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    if (!responseText) {
      throw new Error('Empty response from server');
    }

    const lines = responseText.split('\n').filter(line => line.trim());
    let accumulatedText = '';
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.response) {
          accumulatedText += data.response;
        }
      } catch (e) {
        console.warn('Failed to parse JSON line:', line);
      }
    }
    
    if (accumulatedText.trim()) {
        return accumulatedText;
    } else {
        return 'I received your message but had trouble processing it. Please try again.';
    }

  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Response timed out. Susan might be thinking too hard! Please try again.');
      }
      if (error.message.includes('Network request failed')) {
        throw new Error('Unable to connect to Susan. Make sure the server is running and accessible.');
      }
    }
    // Re-throw other errors to be handled by the UI
    throw error;
  }
}; 