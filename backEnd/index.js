import 'dotenv/config';

import express from 'express';
import db from './db/db.config.js';
import cors from 'cors';
import { errorHandler } from './src/middleware/error-handler.js';
import mainRouter from './src/api/main.routes.js';

const app = express();

app.use(
cors({
origin: [
'http://localhost:5173',
'https://gpt.reyhanahamza.com',
],
})
);

app.use(express.json());

app.use('/api', mainRouter);

// Simple route to check whether the server is responding
app.get('/', (req, res) => {
res.status(200).json({
message: 'GPT Clone API is running',
});
});

// Error-handling middleware
app.use(errorHandler);

async function startServer() {
try {
// Verify the database connection before starting the server
const connection = await db.getConnection();
connection.release();


const PORT = process.env.PORT || 3888;

app.listen(PORT, () => {
  console.log(`GPT Clone API is running on port ${PORT}`);
});


} catch (error) {
console.error('Error starting server:', error.message);
}
}

startServer();
