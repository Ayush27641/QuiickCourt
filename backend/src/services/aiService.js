const axios = require('axios');

class AIService {
  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'gemma3:1b';
  }

  async generateResponse(prompt, context = '') {
    try {
      const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;
      
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500
        }
      });

      return response.data.response;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateBookingRecommendations(userPreferences) {
    const prompt = `
      Based on the following user preferences, suggest sports facilities and activities:
      
      Location: ${userPreferences.location || 'Not specified'}
      Preferred Sports: ${userPreferences.sports?.join(', ') || 'Any'}
      Budget Range: ${userPreferences.budget || 'Not specified'}
      Preferred Time: ${userPreferences.timePreference || 'Flexible'}
      Group Size: ${userPreferences.groupSize || 'Individual'}
      Experience Level: ${userPreferences.experience || 'Beginner'}
      
      Please provide personalized recommendations for sports facilities, activities, and booking suggestions.
      Include reasoning for each recommendation.
    `;

    return await this.generateResponse(prompt);
  }

  async generateGameMatchingSuggestions(playerProfile) {
    const prompt = `
      Help find suitable game partners/opponents for this player:
      
      Sports Interests: ${playerProfile.sports?.join(', ') || 'Various'}
      Skill Level: ${playerProfile.skillLevel || 'Beginner'}
      Preferred Playing Times: ${playerProfile.availability || 'Flexible'}
      Location: ${playerProfile.location || 'Not specified'}
      Age Group: ${playerProfile.ageGroup || 'Any'}
      Playing Style: ${playerProfile.playingStyle || 'Casual'}
      
      Suggest matching criteria and tips for finding compatible players.
      Include advice on how to make the gaming experience enjoyable for all participants.
    `;

    return await this.generateResponse(prompt);
  }

  async generateFacilityManagementAdvice(facilityData) {
    const prompt = `
      Provide management advice for this sports facility:
      
      Facility Type: ${facilityData.type || 'General Sports'}
      Current Utilization: ${facilityData.utilization || 'Unknown'}%
      Peak Hours: ${facilityData.peakHours || 'Not specified'}
      Average Revenue: $${facilityData.revenue || 'Unknown'}/month
      Customer Complaints: ${facilityData.complaints || 'None reported'}
      Facility Age: ${facilityData.age || 'Unknown'} years
      
      Suggest improvements for:
      1. Increasing bookings and revenue
      2. Better customer satisfaction
      3. Operational efficiency
      4. Marketing strategies
      5. Facility maintenance and upgrades
    `;

    return await this.generateResponse(prompt);
  }

  async generateWorkoutPlan(userGoals) {
    const prompt = `
      Create a personalized workout plan based on these goals and constraints:
      
      Primary Goal: ${userGoals.primaryGoal || 'General fitness'}
      Current Fitness Level: ${userGoals.fitnessLevel || 'Beginner'}
      Available Time: ${userGoals.timeAvailable || '30 minutes'} per session
      Preferred Activities: ${userGoals.activities?.join(', ') || 'Any'}
      Equipment Access: ${userGoals.equipment || 'Basic gym equipment'}
      Physical Limitations: ${userGoals.limitations || 'None'}
      Target Timeline: ${userGoals.timeline || '3 months'}
      
      Provide a structured workout plan with:
      1. Weekly schedule
      2. Specific exercises and sets/reps
      3. Progressive difficulty
      4. Tips for success
      5. Safety considerations
    `;

    return await this.generateResponse(prompt);
  }

  async generateSportsAnalysis(gameData) {
    const prompt = `
      Analyze this sports game/match data and provide insights:
      
      Sport: ${gameData.sport || 'Unknown'}
      Game Duration: ${gameData.duration || 'Unknown'}
      Score/Results: ${gameData.results || 'Not provided'}
      Player Performance: ${gameData.performance || 'Not tracked'}
      Key Events: ${gameData.events || 'None recorded'}
      Weather Conditions: ${gameData.weather || 'Indoor/Not applicable'}
      
      Provide analysis including:
      1. Performance highlights
      2. Areas for improvement
      3. Strategic insights
      4. Recommendations for future games
      5. Training suggestions
    `;

    return await this.generateResponse(prompt);
  }

  async chatbotResponse(message, conversationContext = []) {
    const contextString = conversationContext
      .slice(-5) // Keep last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `
      You are a helpful AI assistant for a sports facility booking platform called OdooHackathon.
      You can help users with:
      - Finding and booking sports facilities
      - Sports recommendations and advice
      - Game partner matching
      - Workout planning
      - General sports-related questions
      
      Be friendly, helpful, and concise in your responses.
      If you don't know something specific about the platform, suggest they contact support.
      
      Previous conversation:
      ${contextString}
    `;

    return await this.generateResponse(message, systemPrompt);
  }
}

module.exports = new AIService();
