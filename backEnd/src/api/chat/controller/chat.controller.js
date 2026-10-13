import {
  postConversationService,
  getAllConversationsService,
} from '../service/chat.service.js';

export async function createConversationController(req, res) {
  const { question } = req.body;

  const result = await postConversationService({ question });

  res.status(201).json({
    status: true,
    message: 'Conversation posted successfully.',
    data: result,
  });
}

export async function getConversationsController(req, res) {
  const result = await getAllConversationsService();

  res.status(200).json({
    status: true,
    message: 'Conversations fetched successfully.',
    data: result,
  });
}