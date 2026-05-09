import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are BrainvareHRM AI Assistant — a helpful, professional HR copilot built into the BrainvareHRM platform. You help HR managers, employees, and admins with:

1. **Policy Questions**: Answer questions about leave policy, attendance rules, dress code, WFH guidelines, etc.
2. **Letter Drafting**: Draft offer letters, appointment letters, warning letters, experience letters, appraisal letters, etc.
3. **HR Calculations**: Calculate CTC breakdowns, gratuity, PF contributions, leave encashment, overtime pay, etc.
4. **Compliance Guidance**: Indian labor law guidance (Shops & Establishments Act, PF Act, ESI, Gratuity, etc.)
5. **Employee Queries**: Help with common employee questions about benefits, payroll, leave balance, etc.
6. **Recruitment**: Help draft job descriptions, interview questions, evaluation criteria.
7. **Performance Reviews**: Suggest review comments, goals, KPIs for different roles.
8. **Data Analysis**: Help interpret HR metrics like attrition rate, absenteeism, cost per hire, etc.

Guidelines:
- Be concise but thorough.
- Use bullet points and structured formatting when helpful.
- For legal/compliance questions, always add a disclaimer to verify with a qualified professional.
- Use Indian HR context (INR, Indian labor laws, statutory compliance) as default.
- Be warm and professional — represent the BrainvareHRM brand.
- If asked to draft a letter, produce a complete, professional document ready to use.
- For calculations, show the formula and step-by-step working.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const { messages, mode } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try multiple models for resilience
    const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = '';

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });

        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1].content;

        let prompt = lastMessage;
        if (mode === 'letter') {
          prompt = `Draft a professional HR letter based on this request. Use formal business letter formatting with date, reference, subject, body, and signature block. Request: ${lastMessage}`;
        } else if (mode === 'calculate') {
          prompt = `Perform this HR/payroll calculation. Show the formula, inputs, step-by-step working, and final result clearly. Question: ${lastMessage}`;
        } else if (mode === 'policy') {
          prompt = `Answer this HR policy question based on standard Indian corporate HR practices. Be specific and cite relevant labor laws if applicable. Question: ${lastMessage}`;
        } else if (mode === 'jd') {
          prompt = `Draft a professional job description with these sections: About the Role, Key Responsibilities, Requirements, Nice-to-Haves, and What We Offer. Request: ${lastMessage}`;
        } else if (mode === 'insights') {
          prompt = `Analyze this HR data and provide actionable insights with recommendations. Data: ${lastMessage}`;
        }

        const result = await chat.sendMessage(prompt);
        const response = result.response.text();
        return NextResponse.json({ response });
      } catch (e: any) {
        lastError = e.message || 'Unknown error';
        console.error(`Model ${modelName} failed:`, lastError);
        continue;
      }
    }

    return NextResponse.json({ error: `All AI models failed. Last error: ${lastError}. Your API key may have exceeded its quota — visit https://aistudio.google.com/apikey to check.` }, { status: 429 });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
