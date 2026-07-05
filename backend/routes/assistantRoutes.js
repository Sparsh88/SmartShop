import express from 'express';
import { handleAssistantChat } from '../controllers/assistantController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// The assistant doesn't strictly need to be logged in, but let's make it available to all visitors
router.post('/chat', handleAssistantChat);

export default router;
