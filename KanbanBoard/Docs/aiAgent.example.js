// AI Agent using Google Gemini API (Free tier)
// Get your free API key at: https://makersuite.google.com/app/apikey

// SECURITY NOTE: For production, use a backend server to hide this key!
// For school projects/personal use on localhost, this is acceptable.
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent';

// Optional: Add a simple check to only allow usage on your domain
const ALLOWED_DOMAINS = ['localhost', '127.0.0.1', 'your-github-pages-domain.github.io'];
function checkDomain() {
  const hostname = window.location.hostname;
  if (!ALLOWED_DOMAINS.includes(hostname)) {
    console.warn('AI features disabled on this domain for security');
    return false;
  }
  return true;
}

/**
 * AI Agent for parsing task information
 * @param {string} taskText - The raw task text from user
 * @returns {Promise<{dueDate: string|null, priority: string, cleanText: string}>}
 */
async function parseTaskWithAI(taskText) {
  // Security check
  if (!checkDomain()) {
    throw new Error('Domain not authorized');
  }
  
  const prompt = `You are a task parsing assistant. Extract information from the following task:

Task: "${taskText}"

Please extract:
1. Due date (return in YYYY-MM-DD format, or null if no date mentioned)
2. Priority (High, Medium, or Low based on urgency/importance)
3. Clean task text (remove date-related phrases like "by tomorrow", "due Friday", etc.)

Respond ONLY with valid JSON in this exact format:
{
  "dueDate": "YYYY-MM-DD" or null,
  "priority": "High" or "Medium" or "Low",
  "cleanText": "cleaned task description"
}

Today's date is ${new Date().toISOString().split('T')[0]} (${new Date().toLocaleDateString('en-US', {weekday: 'long'})}).`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response (sometimes AI wraps it in markdown)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and return
    return {
      dueDate: parsed.dueDate || null,
      priority: ['High', 'Medium', 'Low'].includes(parsed.priority) ? parsed.priority : 'Medium',
      cleanText: parsed.cleanText || taskText
    };
  } catch (error) {
    console.error('AI parsing failed:', error);
    // Fallback to basic parsing
    return {
      dueDate: null,
      priority: 'Medium',
      cleanText: taskText
    };
  }
}

/**
 * AI Agent for generating task reminders/notifications
 * @param {Array} tasks - Array of tasks
 * @returns {Promise<string>} - Notification message
 */
async function generateNotification(tasks) {
  // Security check
  if (!checkDomain()) {
    throw new Error('Domain not authorized');
  }
  
  const taskList = tasks.map(t => 
    `- ${t.text} (Due: ${t.dueDate}, Priority: ${t.priority})`
  ).join('\n');

  const prompt = `You are a helpful task notification assistant. Generate a brief, friendly notification message for these upcoming tasks:

${taskList}

Create a concise, motivating message (2-3 sentences max) that highlights the most urgent tasks.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        }
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Notification generation failed:', error);
    return `You have ${tasks.length} upcoming task(s) that need attention!`;
  }
}

/**
 * AI Agent for generating task reports
 * @param {Object} stats - Dashboard statistics
 * @returns {Promise<string>} - Report summary
 */
async function generateReport(stats) {
  // Security check
  if (!checkDomain()) {
    throw new Error('Domain not authorized');
  }
  
  const prompt = `You are a productivity analyst. Generate a brief, insightful report based on these task statistics:

- Total tasks: ${stats.total}
- To-Do: ${stats.todo}
- In Progress: ${stats.progress}
- Done: ${stats.done}
- Overdue: ${stats.overdue}
- Average completion time: ${stats.avgCompletion} days

Provide a 2-3 sentence analysis with actionable insights or encouragement.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Report generation failed:', error);
    return 'Keep up the great work on your tasks!';
  }
}

// Export functions for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseTaskWithAI, generateNotification, generateReport };
}

