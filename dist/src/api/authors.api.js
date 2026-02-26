import { Hono } from 'hono';
import { prisma } from '../prisma.js';
import { zValidator } from '@hono/zod-validator';
import { authorCreateSchema, authorUpdateSchema, pagingQuerySchema, } from '../lib/validation.js';
export const app = new Hono();
// GET /authors
// Tekur við offset og limit querystring breytum sem stýra paging
app.get('/', zValidator('query', pagingQuerySchema), async (c) => {
    try {
        const { limit, offset } = c.req.valid('query');
        const [authors, total] = await Promise.all([
            prisma.author.findMany({
                skip: offset,
                take: limit,
                orderBy: { id: 'desc' },
            }),
            prisma.author.count(),
        ]);
        const response = {
            data: authors,
            paging: {
                limit,
                offset,
                total, // verkefnið biður um total, ekki count
            },
        };
        return c.json(response, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'internal server error' }, 500);
    }
});
// GET /authors/:id
app.get('/:id', async (c) => {
    try {
        const idParam = c.req.param('id');
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            return c.json({ error: 'invalid id' }, 400);
        }
        const author = await prisma.author.findUnique({
            where: { id },
        });
        if (!author) {
            return c.json({ error: 'not found' }, 404);
        }
        return c.json(author, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'internal server error' }, 500);
    }
});
// POST /authors
app.post('/', zValidator('json', authorCreateSchema), async (c) => {
    try {
        const body = c.req.valid('json');
        const author = await prisma.author.create({
            data: {
                name: body.name,
                email: body.email,
            },
        });
        return c.json(author, 201);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'internal server error' }, 500);
    }
});
// PUT /authors/:id (full/normal update route samkvæmt verkefni)
app.put('/:id', zValidator('json', authorUpdateSchema), async (c) => {
    try {
        const idParam = c.req.param('id');
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            return c.json({ error: 'invalid id' }, 400);
        }
        const existing = await prisma.author.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return c.json({ error: 'not found' }, 404);
        }
        const body = c.req.valid('json');
        const updated = await prisma.author.update({
            where: { id },
            data: {
                ...(body.name !== undefined ? { name: body.name } : {}),
                ...(body.email !== undefined ? { email: body.email } : {}),
            },
        });
        return c.json(updated, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'internal server error' }, 500);
    }
});
// PATCH /authors/:id (ef þú vilt halda patch sem þú varst byrjaður með)
app.patch('/:id', zValidator('json', authorUpdateSchema), async (c) => {
    try {
        const idParam = c.req.param('id');
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            return c.json({ error: 'invalid id' }, 400);
        }
        const existing = await prisma.author.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            return c.json({ error: 'not found' }, 404);
        }
        const body = c.req.valid('json');
        const updated = await prisma.author.update({
            where: { id },
            data: {
                ...(body.name !== undefined ? { name: body.name } : {}),
                ...(body.email !== undefined ? { email: body.email } : {}),
            },
        });
        return c.json(updated, 200);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'internal server error' }, 500);
    }
});
// DELETE /authors/:id
app.delete('/:id', async (c) => {
    try {
        const idParam = c.req.param('id');
        const id = Number(idParam);
        if (!Number.isInteger(id) || id <= 0) {
            return c.json({ error: 'invalid id' }, 400);
        }
        const author = await prisma.author.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!author) {
            return c.json({ error: 'not found' }, 404);
        }
        await prisma.author.delete({
            where: { id },
        });
        return c.body(null, 204);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'internal server error' }, 500);
    }
});
