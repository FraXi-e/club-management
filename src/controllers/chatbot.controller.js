const OpenAI = require('openai');
const { Conversation, Message, HealthAssessment } = require('../models');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are a compassionate and knowledgeable medical assistant chatbot. Your role is to:

1. Gather detailed information about the user's symptoms through conversational questions
2. Ask relevant follow-up questions about:
   - Duration and onset of symptoms
   - Severity and frequency
   - Associated symptoms
   - Medical history relevance
   - Lifestyle factors (diet, exercise, stress, sleep)
   - Recent changes or triggers
   
3. After 5-7 exchanges, provide a preliminary health assessment including:
   - Potential health conditions (list 2-4 possibilities)
   - Severity level (low/moderate/high/emergency)
   - Urgency score (1-10)
   - Specific recommendations
   
4. Always maintain a caring, professional tone
5. Never diagnose definitively - always recommend consulting healthcare professionals
6. If symptoms suggest emergency (chest pain, difficulty breathing, severe bleeding, etc.), immediately advise seeking emergency care

Keep responses concise (2-3 sentences) and focused. Ask one question at a time.`;

// Start a new conversation
exports.startConversation = async (req, res) => {
  try {
    const { initialSymptom, userId } = req.body;

    if (!initialSymptom || initialSymptom.trim().length === 0) {
      return res.status(400).json({ error: 'Initial symptom is required' });
    }

    // Create conversation
    const conversation = await Conversation.create({
      userId: userId || null,
      initialSymptom: initialSymptom.trim(),
      status: 'active',
      messageCount: 0
    });

    // Create initial user message
    await Message.create({
      conversationId: conversation.id,
      role: 'user',
      content: initialSymptom.trim()
    });

    // Get AI response
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: initialSymptom.trim() }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 200
    });

    const assistantResponse = completion.choices[0].message.content;

    // Save assistant message
    await Message.create({
      conversationId: conversation.id,
      role: 'assistant',
      content: assistantResponse
    });

    // Update message count
    await conversation.update({ messageCount: 2 });

    res.status(201).json({
      conversationId: conversation.id,
      message: assistantResponse,
      messageCount: 2
    });

  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ 
      error: 'Failed to start conversation',
      details: error.message 
    });
  }
};

// Send a message in existing conversation
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Conversation ID and message are required' });
    }

    // Find conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.status !== 'active') {
      return res.status(400).json({ error: 'Conversation is not active' });
    }

    // Get conversation history
    const history = await Message.findAll({
      where: { conversationId },
      order: [['timestamp', 'ASC']]
    });

    // Create user message
    await Message.create({
      conversationId,
      role: 'user',
      content: message.trim()
    });

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message.trim() }
    ];

    // Check if we should generate assessment (after 5+ user messages)
    const userMessageCount = history.filter(m => m.role === 'user').length + 1;
    const shouldGenerateAssessment = userMessageCount >= 5;

    let assessmentPrompt = '';
    if (shouldGenerateAssessment) {
      assessmentPrompt = '\n\nIMPORTANT: This is the 5th+ exchange. Please provide a comprehensive health assessment now, including: 1) List of potential conditions, 2) Severity level, 3) Urgency score (1-10), 4) Specific recommendations. Format your response clearly.';
      messages[messages.length - 1].content += assessmentPrompt;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: shouldGenerateAssessment ? 500 : 200
    });

    const assistantResponse = completion.choices[0].message.content;

    // Save assistant message
    await Message.create({
      conversationId,
      role: 'assistant',
      content: assistantResponse
    });

    // Update message count
    const newMessageCount = conversation.messageCount + 2;
    await conversation.update({ messageCount: newMessageCount });

    res.json({
      conversationId,
      message: assistantResponse,
      messageCount: newMessageCount,
      shouldGenerateAssessment
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
};

// Get conversation history
exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findByPk(id, {
      include: [
        {
          model: Message,
          as: 'messages',
          order: [['timestamp', 'ASC']]
        },
        {
          model: HealthAssessment,
          as: 'assessment',
          required: false
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);

  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversation',
      details: error.message 
    });
  }
};

// Generate final health assessment
exports.generateAssessment = async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if assessment already exists
    const existingAssessment = await HealthAssessment.findOne({
      where: { conversationId }
    });

    if (existingAssessment) {
      return res.json(existingAssessment);
    }

    // Get conversation history
    const messages = await Message.findAll({
      where: { conversationId },
      order: [['timestamp', 'ASC']]
    });

    if (messages.length < 4) {
      return res.status(400).json({ 
        error: 'Not enough information to generate assessment. Please continue the conversation.' 
      });
    }

    // Build assessment prompt
    const conversationText = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const assessmentPrompt = `Based on the following medical conversation, provide a structured health assessment in JSON format:

${conversationText}

Provide a JSON response with this exact structure:
{
  "symptoms": ["symptom1", "symptom2", ...],
  "potentialConditions": [
    {"name": "Condition Name", "likelihood": "high/medium/low", "description": "brief description"}
  ],
  "severityLevel": "low/moderate/high/emergency",
  "urgencyScore": 1-10,
  "recommendations": "Detailed recommendations including when to see a doctor, self-care measures, and any red flags to watch for"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a medical assessment AI. Provide structured, accurate health assessments in JSON format.' },
        { role: 'user', content: assessmentPrompt }
      ],
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const assessmentData = JSON.parse(completion.choices[0].message.content);

    // Create health assessment
    const assessment = await HealthAssessment.create({
      conversationId,
      symptoms: assessmentData.symptoms || [],
      potentialConditions: assessmentData.potentialConditions || [],
      severityLevel: assessmentData.severityLevel || 'moderate',
      recommendations: assessmentData.recommendations || 'Please consult a healthcare professional.',
      urgencyScore: assessmentData.urgencyScore || 5
    });

    // Update conversation status
    await conversation.update({
      status: 'completed',
      completedAt: new Date()
    });

    res.json(assessment);

  } catch (error) {
    console.error('Error generating assessment:', error);
    res.status(500).json({ 
      error: 'Failed to generate assessment',
      details: error.message 
    });
  }
};

// List all conversations (for admin/history)
exports.listConversations = async (req, res) => {
  try {
    const { userId, status, limit = 50 } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const conversations = await Conversation.findAll({
      where,
      order: [['startedAt', 'DESC']],
      limit: parseInt(limit),
      include: [
        {
          model: HealthAssessment,
          as: 'assessment',
          required: false
        }
      ]
    });

    res.json(conversations);

  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({ 
      error: 'Failed to list conversations',
      details: error.message 
    });
  }
};
