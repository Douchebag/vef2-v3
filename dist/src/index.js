import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { app as authorsApi } from './api/authors.api.js';
import { app as newsApi } from './api/news.api.js';
const app = new Hono();
app.use(prettyJSON()); // With options: prettyJSON({ space: 4 })
app.get('/', (c) => c.json({
    endpoints: {
        authors: [
            'GET /authors',
            'GET /authors/:id',
            'POST /authors',
            'PUT /authors/:id',
            'DELETE /authors/:id',
        ],
        news: [
            'GET /news',
            'GET /news/:slug',
            'POST /news',
            'PUT /news/:slug',
            'DELETE /news/:slug',
        ],
    },
}));
app.route('/authors', authorsApi);
app.route('/news', newsApi);
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
