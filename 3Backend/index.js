// Import dependencies
import express, { json } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import chalk from "chalk";
import url from "url";
import { MistralCore } from "@mistralai/mistralai/core.js";
import { embeddingsCreate } from "@mistralai/mistralai/funcs/embeddingsCreate.js";
import { Mistral } from "@mistralai/mistralai";
// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();
app.use(json());
// Middleware to log requests using morgan
// Custom Morgan format using Chalk for color
morgan.token('split-url', (req) => {
  const { pathname, query } = url.parse(req.url, true);

  let formattedUrl = `${chalk.green('URL:')}\n  ${chalk.cyan('Path:')} ${chalk.yellow(pathname)}`;
  
  if (query) {
    formattedUrl += `\n  ${chalk.cyan('Query:')} ${chalk.magenta(JSON.stringify(query))}`;
  }

  return formattedUrl;
});

morgan.token('status', (req, res) => {
  const status = res.statusCode;
  return status >= 400
    ? chalk.red(status)
    : status >= 300
    ? chalk.yellow(status)
    : chalk.green(status);
});

morgan.token('method', (req) => chalk.cyan(req.method));

const customFormat = ':method :split-url :status :response-time ms';
app.use(morgan(customFormat));

// Routes
app.get("/", async (req, res) => {
  try {
    const chatResult = await ChatMistral("Hello World!");
    res.send(`Hello, World! Chat response: ${chatResult}`);
  } catch (error) {
    res.status(500).send("Error occurred in ChatMistral.");
  }
});

app.get('/userEmbed/:embed', async (req, res) => {
  const embed_Params = req.params.embed;  // Get 'embbed' from the route parameter

  if (!embed_Params) {
    return res.status(400).send("Embedding parameter is required.");
  }

  try {
    const mistralEmbedded = await EmbeddMistral(embed_Params);
    res.send(`User page: ${JSON.stringify(mistralEmbedded)}`);
  } catch (error) {
    res.status(500).send("Error occurred in EmbbedMistral.");
  }
});
// TO DO: Ask Chat GPT if prompt should be from query or body instead
app.get('/userChat', async (req, res) => {
  // Get prompt query from either route parameter or query string
  const prompt = req.params.query || req.query.query;

  if (!prompt) {
    return res.status(400).send("Query parameter is required.");
  }

  try {
    const chatResult = await ChatMistral(prompt);
    res.send(`Chat response: ${chatResult}`);
  } catch (error) {
    res.status(500).send("Error occurred in ChatMistral.");
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
  next();
});

// Set port
const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Initialize Mistral client
const mistralEmbedderClient = new MistralCore({
  apiKey: process.env["MISTRAL_API_KEY"] ?? "",
});

const ChatClient = new Mistral({
  apiKey: process.env["MISTRAL_API_KEY"] ?? "",
});

// ChatMistral function
async function ChatMistral(prompt) {
  try {
    const result = await ChatClient.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          content: prompt,
          role: "user",
        },
      ],
    });

    console.log("Chat Result: " + result.choices[0].message.content);
    return result?.choices[0]?.message?.content;
  } catch (error) {
    console.error("Error in ChatMistral:", error);
    throw error;
  }
}

// EmbeddMistral function
async function EmbeddMistral(textEmbedd) {
  try {
    // Ensure textEmbedd is always an array
    const inputs = Array.isArray(textEmbedd) ? textEmbedd : [textEmbedd];
    
    const res = await embeddingsCreate(mistralEmbedderClient, {
      inputs,
      model: "mistral-embed",
    });

    if (!res.ok) {
      throw res.error;
    }

    console.log("Embeddings result:", res.value.data);
    return res.value.data;
  } catch (error) {
    console.error("Error in EmbeddMistral:", error);
    throw error;
  }
}

