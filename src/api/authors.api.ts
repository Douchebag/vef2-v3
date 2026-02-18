import { Hono } from "hono";
import * as z from 'zod'
import { prisma } from '../prisma.js'
import { zValidator } from "@hono/zod-validator";

export const app = new Hono();

type Author = {
    id: string;
    name: string
}

let tempAuthors: Array<Author> = [
    { id: '1', name: 'temp author 1'},
    {  id: '2',name: 'temp author 2'},
    {  id: '3',name: 'temp author 3'},
    {  id: '4',name: 'temp author 4'},
]

const pagingSchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).max(100).optional().default(0)
})

// Tekur við offset og limit querystring breytum sem stýra paging
// ef valid, annars e-ð default
app.get('/', zValidator('query', pagingSchema), async (c) => {
    const limit = c.req.valid('query').limit
    const offset = c.req.valid('query').offset

    const authors = await prisma.author.findMany({ skip: offset, take: limit })
    const authorsCount = await prisma.author.count()

    const response = {
        data: authors,
        paging: {
            limit,
            offset,
            count: authorsCount
        }
    }

    return c.json(response)
})

app.get('/:id', async (c) => {
    const id = c.req.param('id');

    const author = await prisma.author.findUnique({
      where: { id: Number(id) },
    });

    if (!author) {
        return c.json({ error: 'not found' }, 404)
    }

    return c.json(author);
})

app.delete('/:id', (c) => {
    const id = c.req.param('id');

    const author = tempAuthors.find(i => i.id === id);

    if (!author) {
        return c.json({ error: 'not found' }, 404)
    }

    tempAuthors = tempAuthors.filter(i => i.id !== id);

    return c.json(null, 200);
})

app.patch('/:id', (c) => {

    // TODO
})
