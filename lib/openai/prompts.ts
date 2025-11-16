/**
 * AI prompt templates for various tasks
 */

export const PROMPTS = {
  generateTitle: (content: string) => `
Generate a concise, engaging, and creative title (max 10 words) for this note.
The title should:
- Capture the essence and deeper meaning, not just summarize
- Be thought-provoking and memorable
- Use creative language when appropriate
- Match the language of the content (Chinese if content is in Chinese, English if in English)

Content: "${content}"

Return only the title, no quotes or extra text.
`.trim(),

  classifyTopic: (content: string) => `
Classify this note into one of these topics:
- Personal Reflection
- Work/Professional
- Creative Idea
- Learning/Education
- Health/Wellness
- Relationships
- Goals/Planning
- Random Thought
- Other

Note content: "${content}"

Return only the topic name, nothing else.
`.trim(),

  detectEmotion: (content: string) => `
Analyze the emotion in this note and return one of:
- Joy
- Sadness
- Anger
- Fear
- Surprise
- Disgust
- Neutral
- Contemplative
- Excited
- Anxious
- Grateful
- Frustrated

Note content: "${content}"

Return only the emotion name, nothing else.
`.trim(),

  generateTags: (content: string, title: string, topic: string, emotion: string) => `
Generate 3-5 relevant tags for this note. Tags should be:
- Short (1-2 words)
- Descriptive and meaningful
- Can be in Chinese or English (use Chinese if the content is in Chinese, otherwise use English)
- Comma-separated
- Creative and insightful, not just literal keywords

Title: "${title}"
Topic: "${topic}"
Emotion: "${emotion}"
Content: "${content}"

Return only the tags separated by commas, no other text.
`.trim(),

  generateSummary: (content: string, title: string) => `
Generate a creative and insightful summary (2-3 sentences) of this note.
The summary should:
- Not just repeat the content, but add depth and perspective
- Reveal underlying themes, insights, or implications
- Be thought-provoking and meaningful
- Use creative language when appropriate
- Match the language of the content (Chinese if content is in Chinese, English if in English)
- Show understanding of the deeper meaning beyond the surface

Title: "${title}"
Content: "${content}"

Return only the summary, no quotes or extra text.
`.trim(),

  findRelatedNotes: (currentNote: { title: string; content: string; topic: string; tags: string[] }, otherNotes: Array<{ id: string; title: string; content: string; topic: string; tags: string[] }>) => `
Given this note:
Title: "${currentNote.title}"
Content: "${currentNote.content}"
Topic: "${currentNote.topic}"
Tags: ${currentNote.tags.join(', ')}

And these other notes:
${otherNotes.map((note, idx) => `
${idx + 1}. ID: ${note.id}
   Title: ${note.title}
   Content: ${note.content}
   Topic: ${note.topic}
   Tags: ${note.tags.join(', ')}
`).join('\n')}

Find the 3 most related notes by ID. Consider:
- Similar topics or themes
- Related tags
- Content similarity
- Complementary ideas

Return only the IDs separated by commas, like: "id1,id2,id3"
`.trim(),

  weeklyReview: (notes: Array<{ title: string; content: string; topic: string; emotion: string; tags: string[]; created_at: string }>) => `
Analyze these notes from the past week and generate insights:

${notes.map((note, idx) => `
${idx + 1}. ${note.title} (${note.topic}, ${note.emotion})
   ${note.content}
   Tags: ${note.tags.join(', ')}
   Date: ${note.created_at}
`).join('\n\n')}

Generate:
1. Top 3 themes (what topics/patterns emerged)
2. Emotional trends (how emotions changed over the week)
3. 3 highlight cards (most significant or interesting notes)
4. A 1-paragraph weekly reflection

Return your response as JSON:
{
  "themes": ["theme1", "theme2", "theme3"],
  "emotionalTrends": "description of emotional patterns",
  "highlights": ["note title 1", "note title 2", "note title 3"],
  "reflection": "one paragraph reflection"
}
`.trim(),
};

