import db from '../../../../db/db.config.js';
import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Safely extracts total token count from Gemini API response.
 */
const extractTotalTokenCount = (response) => {
  const usageMetadata = response?.usageMetadata;
  if (!usageMetadata) return 0;
  
  if (usageMetadata.totalTokenCount > 0) {
    return usageMetadata.totalTokenCount;
  }
  
  const promptTokens = Number(usageMetadata.promptTokenCount || 0);
  const candidateTokens = Number(usageMetadata.candidateTokenCount || 0);
  return promptTokens + candidateTokens;
};

/**
 * Fetches the most recent conversation rows formatted for prompt history.
 */
const getRecentConversationRows = async (limit = 5) => {
  const normalizedLimit = Number.parseInt(limit, 10);
  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0
      ? 20
      : normalizedLimit;

  const [rows] = await db.execute(
    `SELECT id, role, content, created_at
     FROM conversations
     ORDER BY id DESC
     LIMIT ?`,
    [safeLimit]
  );

  return rows.reverse();
};

/**
 * Sends history and current question to Gemini API and gets the assistant response.
 */
const generateAssistantAnswer = async ({ historyRows, question }) => {
  const formattedHistory = historyRows.map((row) => ({
    role: row.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: row.content }],
  }));

  const chat = geminiClient.chats.create({
      model: GEMINI_MODEL,
    config: {
    maxOutputTokens:1024,
    systemInstruction: `
    You are a helpful, intelligent, and friendly AI assistant.

Your job is to understand the user's questions and provide accurate, useful, and easy-to-understand answers.

Follow these rules:

1. Always answer the user's question directly.
2. If the user asks for an explanation, explain it clearly and step-by-step when appropriate.
3. Keep answers concise unless the user asks for more detail.
4. If you are unsure about something, say that you are unsure rather than making up information.
5. Never intentionally provide false or misleading information.
6. Be respectful and professional, while still maintaining a natural and friendly tone.

`

    },
    history: formattedHistory,
  });

  const result = await chat.sendMessage({ message: question });
  const totalTokens = extractTotalTokenCount(result);

  return { 
    text: result.text, 
    totalTokens 
  };
};

/**
 * Retrieves a single formatted message record by its primary key.
 */
const getMessageById = async (messageId) => {
  const [rows] = await db.execute(
    'SELECT id, role, content, token_count, created_at FROM conversations WHERE id = ? LIMIT 1',
    [messageId]
  );

  if (!rows[0]) return null;

  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    tokenCount: Number(rows[0].token_count || 0),
    createdAt: rows[0].created_at,
  };
};

/**
 * Fetches all conversations ordered chronologically.
 * @returns {Promise<Array>}
 */
export const getAllConversationsService = async () => {
  const [rows] = await db.execute(
    'SELECT id, role, content, token_count, created_at FROM conversations ORDER BY id ASC'
  );
  return rows;
};

/**
 * Creates a new conversation entry (user prompt + assistant response).
 * @param {object} params
 * @param {string} params.question
 * @returns {Promise<{userConversation: object, assistantConversation: object}>}
 */
export const postConversationService = async ({ question }) => {
  if (!question || !question.trim()) {
    const error = new Error('Question is required');
    error.status = 400;
    throw error;
  }

  const historyRows = await getRecentConversationRows(5);

  const [result] = await db.execute(
    'INSERT INTO conversations (content, role) VALUES (?, "user")',
    [question]
  );

  const { text, totalTokens } = await generateAssistantAnswer({
    historyRows,
    question,
  });

  const [createAssistantMessageResult] = await db.execute(
    'INSERT INTO conversations (role, content, token_count) VALUES (?, ?, ?)',
    ['assistant', text, totalTokens]
  );

  const userConversation = await getMessageById(result.insertId);
  const assistantConversation = await getMessageById(
    createAssistantMessageResult.insertId
  );

  return {
    userConversation,
    assistantConversation,
  };
};