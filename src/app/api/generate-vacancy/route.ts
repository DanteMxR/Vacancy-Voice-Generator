import { NextRequest, NextResponse } from 'next/server';

// Используем только разрешённые модели: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano
const OPENAI_MODEL = 'gpt-4.1';
// Лимиты: 40 000 токенов в минуту, 60 запросов в минуту

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const prompt = `Сформируй профессиональное описание вакансии для hh.ru на основе следующих данных:\n\nО компании и проекте: ${answers[0]}\nСтек и технологии: ${answers[1]}\nУсловия: ${answers[2]}\nТребования: ${answers[3]}\nЧем предстоит заниматься: ${answers[4]}\n\nОформи текст строго в markdown:\n- Заголовки — через ###\n- Списки — через -\n- Выделения — через **\n- Не используй просто абзацы для списков, только списки!\n- Не добавляй пустых строк между пунктами списка.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 900,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ text: data.error?.message || 'Ошибка генерации (OpenAI)' });
    }
    const text = data.choices?.[0]?.message?.content || 'Ошибка генерации (нет ответа)';
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ text: 'Ошибка сервера: ' + (e?.message || e?.toString() || 'Неизвестная ошибка') });
  }
} 