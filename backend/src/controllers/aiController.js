const aiService = require('../services/aiService');
const Joi = require('joi');

// Validation schemas
const recommendationSchema = Joi.object({
  location: Joi.string().optional(),
  sports: Joi.array().items(Joi.string()).optional(),
  budget: Joi.string().optional(),
  timePreference: Joi.string().optional(),
  groupSize: Joi.number().integer().positive().optional(),
  experience: Joi.string().optional()
});

const matchingSchema = Joi.object({
  sports: Joi.array().items(Joi.string()).optional(),
  skillLevel: Joi.string().optional(),
  availability: Joi.string().optional(),
  location: Joi.string().optional(),
  ageGroup: Joi.string().optional(),
  playingStyle: Joi.string().optional()
});

const facilityAdviceSchema = Joi.object({
  type: Joi.string().optional(),
  utilization: Joi.number().min(0).max(100).optional(),
  peakHours: Joi.string().optional(),
  revenue: Joi.number().positive().optional(),
  complaints: Joi.string().optional(),
  age: Joi.number().positive().optional()
});

const workoutPlanSchema = Joi.object({
  primaryGoal: Joi.string().optional(),
  fitnessLevel: Joi.string().optional(),
  timeAvailable: Joi.string().optional(),
  activities: Joi.array().items(Joi.string()).optional(),
  equipment: Joi.string().optional(),
  limitations: Joi.string().optional(),
  timeline: Joi.string().optional()
});

const sportsAnalysisSchema = Joi.object({
  sport: Joi.string().optional(),
  duration: Joi.string().optional(),
  results: Joi.string().optional(),
  performance: Joi.string().optional(),
  events: Joi.string().optional(),
  weather: Joi.string().optional()
});

const chatbotSchema = Joi.object({
  message: Joi.string().required(),
  conversationContext: Joi.array().items(Joi.object({
    role: Joi.string().valid('user', 'assistant').required(),
    content: Joi.string().required()
  })).optional()
});

class AIController {
  async getBookingRecommendations(req, res) {
    try {
      const { error, value } = recommendationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const recommendations = await aiService.generateBookingRecommendations(value);
      
      res.status(200).json({
        message: 'Recommendations generated successfully',
        recommendations
      });
    } catch (error) {
      console.error('AI recommendations error:', error);
      res.status(500).json({ message: 'Failed to generate recommendations' });
    }
  }

  async getGameMatchingSuggestions(req, res) {
    try {
      const { error, value } = matchingSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const suggestions = await aiService.generateGameMatchingSuggestions(value);
      
      res.status(200).json({
        message: 'Matching suggestions generated successfully',
        suggestions
      });
    } catch (error) {
      console.error('AI matching suggestions error:', error);
      res.status(500).json({ message: 'Failed to generate matching suggestions' });
    }
  }

  async getFacilityManagementAdvice(req, res) {
    try {
      // Only facility owners and admins can access this
      if (req.user.role !== 'FACILITY_OWNER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const { error, value } = facilityAdviceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const advice = await aiService.generateFacilityManagementAdvice(value);
      
      res.status(200).json({
        message: 'Management advice generated successfully',
        advice
      });
    } catch (error) {
      console.error('AI facility advice error:', error);
      res.status(500).json({ message: 'Failed to generate facility advice' });
    }
  }

  async getWorkoutPlan(req, res) {
    try {
      const { error, value } = workoutPlanSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const workoutPlan = await aiService.generateWorkoutPlan(value);
      
      res.status(200).json({
        message: 'Workout plan generated successfully',
        workoutPlan
      });
    } catch (error) {
      console.error('AI workout plan error:', error);
      res.status(500).json({ message: 'Failed to generate workout plan' });
    }
  }

  async getSportsAnalysis(req, res) {
    try {
      const { error, value } = sportsAnalysisSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const analysis = await aiService.generateSportsAnalysis(value);
      
      res.status(200).json({
        message: 'Sports analysis generated successfully',
        analysis
      });
    } catch (error) {
      console.error('AI sports analysis error:', error);
      res.status(500).json({ message: 'Failed to generate sports analysis' });
    }
  }

  async chatbot(req, res) {
    try {
      const { error, value } = chatbotSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const response = await aiService.chatbotResponse(
        value.message, 
        value.conversationContext || []
      );
      
      res.status(200).json({
        message: 'Chatbot response generated successfully',
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AI chatbot error:', error);
      res.status(500).json({ message: 'Failed to generate chatbot response' });
    }
  }

  async getHealthCheck(req, res) {
    try {
      // Simple health check for AI service
      const testResponse = await aiService.generateResponse('Hello, are you working?');
      
      res.status(200).json({
        status: 'AI service is operational',
        model: process.env.OLLAMA_MODEL || 'gemma3:1b',
        host: process.env.OLLAMA_HOST || 'http://localhost:11434',
        testResponse: testResponse.substring(0, 100) + '...'
      });
    } catch (error) {
      console.error('AI health check error:', error);
      res.status(503).json({ 
        status: 'AI service unavailable',
        error: error.message 
      });
    }
  }
}

module.exports = new AIController();
