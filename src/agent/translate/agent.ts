import { createAgent } from '@agentuity/runtime';
import { s } from '@agentuity/schema';
import OpenAI from 'openai';

const client = new OpenAI();

interface TranslationHistory {
	text: string;
	toLanguage: string;
	translation: string;
	wordCount: number;
	timestamp: string;
}

const agent = createAgent('translate', {
	description: 'Translates text to different languages',
	schema: {
		input: s.object({
			text: s.optional(s.string()),
			toLanguage: s.optional(s.enum(['Spanish', 'French', 'German', 'Japanese', 'Chinese'])),
			command: s.optional(s.enum(['translate', 'clear'])),
		}),
		output: s.object({
			translation: s.string(),
			wordCount: s.number(),
			tokens: s.number(),
			history: s.array(
				s.object({
					text: s.string(),
					toLanguage: s.string(),
					translation: s.string(),
					wordCount: s.number(),
					timestamp: s.string(),
				})
			),
			threadId: s.string(),
			translationCount: s.number(),
		}),
	},
	handler: async (ctx, input) => {
		const { text, toLanguage = 'Spanish', command = 'translate' } = input;

		// Handle clear command
		if (command === 'clear') {
			ctx.thread.state.set('history', []);
			ctx.logger.info('History cleared', { threadId: ctx.thread.id });
			return {
				translation: '',
				wordCount: 0,
				tokens: 0,
				history: [],
				threadId: ctx.thread.id,
				translationCount: 0,
			};
		}

		// Require text for translation
		if (!text) {
			return {
				translation: '',
				wordCount: 0,
				tokens: 0,
				history: (ctx.thread.state.get('history') as TranslationHistory[]) ?? [],
				threadId: ctx.thread.id,
				translationCount: ((ctx.thread.state.get('history') as TranslationHistory[]) ?? []).length,
			};
		}
		ctx.logger.info('Translation requested', {
			toLanguage,
			textLength: text.length,
			threadId: ctx.thread.id,
		});

		const completion = await client.chat.completions.create({
			model: 'gpt-5-nano',
			response_format: { type: 'json_object' },
			messages: [
				{
					role: 'system',
					content: `You are a professional translator. Translate the given text to ${toLanguage}.

Respond in JSON format:
{
  "translation": "the translated text"
}`,
				},
				{
					role: 'user',
					content: text,
				},
			],
		});

		const content = completion.choices[0]?.message?.content ?? '{}';
		const result = JSON.parse(content) as {
			translation: string;
		};

		const wordCount = result.translation.split(/\s+/).filter(Boolean).length;

		// Store in thread history
		const history = (ctx.thread.state.get('history') as TranslationHistory[]) ?? [];
		const newEntry: TranslationHistory = {
			text: text.length > 100 ? `${text.slice(0, 100)}...` : text,
			toLanguage,
			translation: result.translation.length > 100 ? `${result.translation.slice(0, 100)}...` : result.translation,
			wordCount,
			timestamp: new Date().toISOString(),
		};

		// Keep last 10 translations
		const updatedHistory = [newEntry, ...history].slice(0, 10);
		ctx.thread.state.set('history', updatedHistory);

		ctx.logger.info('Translation completed', {
			wordCount,
			tokens: completion.usage?.total_tokens ?? 0,
			historyCount: updatedHistory.length,
		});

		return {
			translation: result.translation,
			wordCount,
			tokens: completion.usage?.total_tokens ?? 0,
			history: updatedHistory,
			threadId: ctx.thread.id,
			translationCount: updatedHistory.length,
		};
	},
});

export default agent;
