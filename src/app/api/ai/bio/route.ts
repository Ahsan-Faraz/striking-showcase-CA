import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const bioRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  classYear: z.number(),
  school: z.string().optional(),
  state: z.string().optional(),
  dominantHand: z.string().optional(),
  style: z.string().optional(),
  seasonAverage: z.number().optional(),
  highGame: z.number().optional(),
  highSeries: z.number().optional(),
  gpa: z.number().optional(),
  intendedMajor: z.string().optional(),
  bowlingGoals: z.string().optional(),
  personalStory: z.string().optional(),
  strengths: z.string().optional(),
  whyCollegeBowling: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured. Set ANTHROPIC_API_KEY.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const data = bioRequestSchema.parse(body);

    // Build context for Claude
    const statsContext = [
      data.seasonAverage && `Season Average: ${data.seasonAverage}`,
      data.highGame && `High Game: ${data.highGame}`,
      data.highSeries && `High Series: ${data.highSeries}`,
      data.gpa && `GPA: ${data.gpa}`,
      data.dominantHand && `${data.dominantHand === 'LEFT' ? 'Left' : 'Right'}-handed`,
      data.style && `${data.style === 'TWO_HANDED' ? 'Two-handed' : 'One-handed'} bowler`,
    ].filter(Boolean).join(', ');

    const personalContext = [
      data.bowlingGoals && `Bowling Goals: ${data.bowlingGoals}`,
      data.personalStory && `Personal Story: ${data.personalStory}`,
      data.strengths && `Strengths: ${data.strengths}`,
      data.whyCollegeBowling && `Why College Bowling: ${data.whyCollegeBowling}`,
    ].filter(Boolean).join('\n');

    const prompt = `Write a compelling recruiting bio for a high school bowler's college recruitment portfolio. The bio should be 2-3 paragraphs, professional yet personable, and highlight what makes this athlete stand out.

Athlete Information:
- Name: ${data.firstName} ${data.lastName}
- Class of ${data.classYear}
${data.school ? `- School: ${data.school}` : ''}
${data.state ? `- State: ${data.state}` : ''}
${data.intendedMajor ? `- Intended Major: ${data.intendedMajor}` : ''}

Stats: ${statsContext}

${personalContext ? `Additional Context:\n${personalContext}` : ''}

Guidelines:
- Write in first person
- Be authentic and conversational, not overly formal
- Lead with bowling achievements and passion
- Include academic goals if GPA/major is provided
- End with future aspirations and what they'd bring to a collegiate program
- Keep it between 150-250 words
- Do NOT include the athlete's name at the beginning (the profile already shows their name)`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('Claude API error:', errData);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const result = await response.json();
    const bio = result.content[0]?.text || '';

    return NextResponse.json({ bio });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Bio generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
