// AI Service Integrations with proper error handling

export class OpenAIService {
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1'

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
  }

  private async makeRequest(endpoint: string, body: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      console.error('OpenAI API request failed:', error)
      throw error
    }
  }

  async generateResume(studentData: any): Promise<string> {
    try {
      const data = await this.makeRequest('/chat/completions', {
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are a professional resume writer. Create a well-formatted resume based on the student data provided. Format it in a clean, professional manner with proper sections.'
        }, {
          role: 'user',
          content: `Create a professional resume for: ${JSON.stringify(studentData, null, 2)}`
        }],
        max_tokens: 1500,
        temperature: 0.7
      })

      return data.choices[0]?.message?.content || 'Unable to generate resume at this time.'
    } catch (error) {
      console.error('Resume generation error:', error)
      return 'Resume generation service is temporarily unavailable. Please try again later.'
    }
  }

  async getCareerSuggestions(skills: string[], interests: string[]): Promise<string[]> {
    try {
      const data = await this.makeRequest('/chat/completions', {
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are a career counselor. Provide exactly 5 career suggestions based on skills and interests. Return each suggestion on a new line.'
        }, {
          role: 'user',
          content: `Skills: ${skills.join(', ')}. Interests: ${interests.join(', ')}. Suggest 5 specific career paths.`
        }],
        max_tokens: 500,
        temperature: 0.8
      })

      const content = data.choices[0]?.message?.content || ''
      const suggestions = content.split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5)

      return suggestions.length > 0 ? suggestions : [
        'Software Developer',
        'Data Analyst', 
        'Product Manager',
        'UX Designer',
        'Business Analyst'
      ]
    } catch (error) {
      console.error('Career suggestions error:', error)
      return [
        'Software Developer',
        'Data Analyst',
        'Product Manager', 
        'UX Designer',
        'Business Analyst'
      ]
    }
  }

  async summarizeResume(resumeText: string): Promise<string> {
    try {
      const data = await this.makeRequest('/chat/completions', {
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'Summarize this resume in 2-3 sentences highlighting key skills and experience. Be concise and professional.'
        }, {
          role: 'user',
          content: resumeText
        }],
        max_tokens: 200,
        temperature: 0.5
      })

      return data.choices[0]?.message?.content || 'Unable to summarize resume at this time.'
    } catch (error) {
      console.error('Resume summary error:', error)
      return 'Resume summary service is temporarily unavailable.'
    }
  }

  async analyzeJobMatch(studentProfile: any, jobPosting: any): Promise<{ score: number; reasons: string[] }> {
    try {
      const data = await this.makeRequest('/chat/completions', {
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'Analyze how well a student profile matches a job posting. Return a JSON object with "score" (0-100) and "reasons" (array of strings explaining the match).'
        }, {
          role: 'user',
          content: `Student: ${JSON.stringify(studentProfile)}. Job: ${JSON.stringify(jobPosting)}`
        }],
        max_tokens: 300,
        temperature: 0.3
      })

      const content = data.choices[0]?.message?.content || '{}'
      try {
        const result = JSON.parse(content)
        return {
          score: Math.max(0, Math.min(100, result.score || 50)),
          reasons: Array.isArray(result.reasons) ? result.reasons : ['General skill alignment']
        }
      } catch {
        return { score: 50, reasons: ['Unable to analyze match at this time'] }
      }
    } catch (error) {
      console.error('Job match analysis error:', error)
      return { score: 50, reasons: ['Job matching service temporarily unavailable'] }
    }
  }
}

export class MoodAnalysisService {
  private apiKey: string
  private modelUrl = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest'

  constructor() {
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || ''
  }

  async analyzeMood(text: string): Promise<{ sentiment: string; confidence: number }> {
    if (!this.apiKey) {
      console.warn('HuggingFace API key not configured')
      return { sentiment: 'neutral', confidence: 0.5 }
    }

    if (!text || text.trim().length === 0) {
      return { sentiment: 'neutral', confidence: 0.5 }
    }

    try {
      const response = await fetch(this.modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: text.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data && Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        const result = data[0].reduce((prev: any, curr: any) => 
          (prev.score || 0) > (curr.score || 0) ? prev : curr
        )
        
        return {
          sentiment: (result.label || 'neutral').toLowerCase().replace('label_', ''),
          confidence: Math.round((result.score || 0.5) * 100) / 100
        }
      }

      return { sentiment: 'neutral', confidence: 0.5 }
    } catch (error) {
      console.error('Mood analysis error:', error)
      return { sentiment: 'neutral', confidence: 0.5 }
    }
  }

  calculateResilienceScore(moodLogs: any[]): number {
    if (!Array.isArray(moodLogs) || moodLogs.length === 0) {
      return 50
    }

    try {
      const recentLogs = moodLogs.slice(-7) // Last 7 days
      
      if (recentLogs.length === 0) {
        return 50
      }

      const avgMood = recentLogs.reduce((sum, log) => sum + (log.mood_score || 5), 0) / recentLogs.length
      const avgStress = recentLogs.reduce((sum, log) => sum + (log.stress_level || 5), 0) / recentLogs.length
      const avgEnergy = recentLogs.reduce((sum, log) => sum + (log.energy_level || 5), 0) / recentLogs.length

      // Calculate resilience score (0-100)
      const resilienceScore = Math.round(
        (avgMood * 0.4 + (10 - avgStress) * 0.3 + avgEnergy * 0.3) * 10
      )

      return Math.max(0, Math.min(100, resilienceScore))
    } catch (error) {
      console.error('Resilience calculation error:', error)
      return 50
    }
  }

  generateWellnessRecommendations(moodScore: number, stressLevel: number, energyLevel: number): string[] {
    const recommendations: string[] = []

    try {
      if (moodScore < 4) {
        recommendations.push('Consider talking to a counselor or trusted friend')
        recommendations.push('Try engaging in activities you enjoy')
      }

      if (stressLevel > 7) {
        recommendations.push('Practice deep breathing or meditation')
        recommendations.push('Take regular breaks from work/study')
        recommendations.push('Consider time management techniques')
      }

      if (energyLevel < 4) {
        recommendations.push('Ensure you\'re getting adequate sleep')
        recommendations.push('Try light exercise or a short walk')
        recommendations.push('Check your nutrition and hydration')
      }

      if (recommendations.length === 0) {
        recommendations.push('Keep up the great work on your wellness!')
        recommendations.push('Continue your current healthy habits')
      }

      return recommendations
    } catch (error) {
      console.error('Wellness recommendations error:', error)
      return ['Focus on self-care and reach out for support when needed']
    }
  }
}

// Create singleton instances with error handling
export const openAIService = new OpenAIService()
export const moodAnalysisService = new MoodAnalysisService()

// Export utility functions
export const aiUtils = {
  async safeApiCall<T>(
    apiCall: () => Promise<T>,
    fallbackValue: T,
    errorMessage: string = 'Service temporarily unavailable'
  ): Promise<T> {
    try {
      return await apiCall()
    } catch (error) {
      console.error(errorMessage, error)
      return fallbackValue
    }
  },

  validateApiKeys(): { openai: boolean; huggingface: boolean } {
    return {
      openai: !!(import.meta.env.VITE_OPENAI_API_KEY),
      huggingface: !!(import.meta.env.VITE_HUGGINGFACE_API_KEY)
    }
  }
}