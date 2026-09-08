import { z } from 'zod';

const LLMResultSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()),
  body: z.string().min(1),
});

export interface LLMResult {
  title: string;
  description: string;
  tags: string[];
  body: string;
}

export async function callDeepSeek(opts: {
  system: string;
  user: string;
  apiKey: string;
  apiBase: string;
  model: string;
  temperature: number;
}): Promise<LLMResult> {
  const res = await fetch(`${opts.apiBase}/chat/completions`, {
    method: 'POST',
    signal: AbortSignal.timeout(120_000),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      temperature: opts.temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`DeepSeek API ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const parsed = JSON.parse(data.choices[0].message.content);
  return LLMResultSchema.parse(parsed) as LLMResult;
}
