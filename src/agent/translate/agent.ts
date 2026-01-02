/**
 * Translation Agent: demonstrates AI Gateway, thread state, and structured logging.
 * Schema defines the input/output shape; TypeScript types are inferred automatically.
 */
import { createAgent } from '@agentuity/runtime';
import { s } from '@agentuity/schema';
import OpenAI from 'openai';

// AI Gateway: use any AI provider (OpenAI, Anthropic, Google, etc.) with a single API key
const client = new OpenAI();

export const AgentInput = s.object({
	text: s.string(),
	toLanguage: s.enum(['Spanish', 'French', 'German', 'Chinese']),
});

export const AgentOutput = s.object({
	translation: s.string(),
	threadId: s.string(),
	translationCount: s.number(),
});

const agent = createAgent('translate', {
	description: 'Translates text to different languages',
	schema: {
		input: AgentInput,
		output: AgentOutput,
	},
	handler: async (ctx, { text, toLanguage }) => {
		ctx.logger.info('Translation requested', { toLanguage, textLength: text.length });

		// Thread state persists across requests - useful for tracking session-level data
		const count = ((await ctx.thread.state.get<number>('count')) ?? 0) + 1;
		await ctx.thread.state.set('count', count);

		const prompt = `Translate to ${toLanguage}:\n\n${text}`;

		const completion = await client.chat.completions.create({
			model: 'gpt-5-nano',
			messages: [{ role: 'user', content: prompt }],
		});

		const translation = completion.choices[0]?.message?.content ?? '';

		ctx.logger.info('Translation completed', { tokens: completion.usage?.total_tokens });

		return {
			translation,
			threadId: ctx.thread.id,
			translationCount: count,
		};
	},
});

export default agent;
