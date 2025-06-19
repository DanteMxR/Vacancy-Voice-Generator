export async function generateVacancyDescription(answers: string[]): Promise<{ text: string; error?: string }> {
  try {
    const res = await fetch('/api/generate-vacancy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    if (res.ok && data.text) {
      return { text: data.text };
    } else {
      return { text: '', error: data.text || 'Нет ответа от сервера' };
    }
  } catch (e: any) {
    return { text: '', error: e?.message || 'Неизвестная ошибка' };
  }
} 