import { ChatOllama } from "@langchain/ollama";
import { createServer } from 'node:http';

const server = createServer(async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  const model = new ChatOllama({
    model: "susan",  // Default value.
  });

  const result = await model.invoke(["human", "Hello, how are you?"]);
  
  console.log(result);

  res.end('Hello World!\n');
});

// starts a simple http server locally on port 3000
server.listen(3000, '127.0.0.1', async () => {
  console.log('Listening on 127.0.0.1:3000');

  const model = new ChatOllama({
    model: "susan",  // Default value.
  });

  const result = await model.invoke(["human", "Hello, how are you?"]);
  
  console.log(result);

//   result.end(result);
});