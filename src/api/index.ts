import { createRouter } from '@agentuity/runtime';
import translate from '@agent/translate';

const api = createRouter();

// POST /api/translate - Create a translation
api.post('/translate', translate.validator(), async (c) => {
	const data = c.req.valid('json');
	const result = await translate.run(data);
	return c.json(result);
});

export default api;
