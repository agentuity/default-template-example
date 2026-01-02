/**
 * Evals run automatically after each agent execution to assess output quality.
 * Results are logged and available in the console (they don't block responses).
 */
import OpenAI from 'openai';
import { politeness } from '@agentuity/evals';
import agent, { AgentInput, AgentOutput } from './agent';

const client = new OpenAI();

export default agent;

// Preset eval (score): Uses the built-in politeness eval with middleware to adapt schemas
export const politenessEval = agent.createEval(
	politeness<typeof AgentInput, typeof AgentOutput>({
		threshold: 0.7,
		middleware: {
			transformInput: (input) => ({ request: `Translate "${input.text}" to ${input.toLanguage}` }),
			transformOutput: (output) => ({ response: output.translation }),
		},
	})
);

// Custom eval (binary): LLM-as-judge to verify translation is in the correct language
export const correctLanguageEval = agent.createEval({
	name: 'correct-language',
	description: 'Verifies the translation is in the target language',
	handler: async (_ctx, input, output) => {
		const completion = await client.chat.completions.create({
			model: 'gpt-5-nano',
			response_format: { type: 'json_object' },
			messages: [
				{
					role: 'system',
					content: `Is this text written in ${input.toLanguage}? Respond with JSON: { "correct": true/false, "reason": "brief explanation" }`,
				},
				{ role: 'user', content: output.translation },
			],
		});

		const result = JSON.parse(completion.choices[0]?.message?.content ?? '{}') as {
			correct: boolean;
			reason: string;
		};

		return { passed: result.correct ?? false, metadata: { reason: result.reason ?? 'No response' } };
	},
});
