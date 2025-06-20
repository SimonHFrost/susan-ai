// Configuration for different development environments
const getApiBaseUrl = () => {
  const backendUrl = process.env.BACKEND_URL;
  const backendPort = process.env.BACKEND_PORT;
  return `http://${backendUrl}:${backendPort}`;
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