import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import xss from 'xss';
import { prisma } from '../prisma.js';
import { newsCreateSchema, newsUpdateSchema, pagingQuerySchema } from '../lib/validation.js';
import { paged } from '../lib/paging.js';
import { slugify } from '../lib/slug.js';

export const app = new Hono();

async function createUniqueSlug(title: string, excludeId?: number): Promise<string> {
  const base = slugify(title) || 'news';
  let slug = base;
  let i = 2;

  while (true) {
    const existing = await prisma.news.findFirst({
      where: {
        slug,
        ...(excludeId !== undefined ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

app.get('/', async (c) => {
  try {
    const query = pagingQuerySchema.safeParse({
      limit: c.req.query('limit'),
      offset: c.req.query('offset'),
    });

    if (!query.success) {
      return c.json({ errors: query.error.flatten() }, 400);
    }

    const { limit, offset } = query.data;

    const [total, news] = await Promise.all([
      prisma.news.count(),
      prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return c.json(paged(news, { limit, offset, total }), 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const item = await prisma.news.findUnique({
      where: { slug },
      include: { author: true },
    });

    if (!item) {
      return c.json({ error: 'News not found' }, 404);
    }

    return c.json(item, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/', zValidator('json', newsCreateSchema), async (c) => {
  try {
    const body = c.req.valid('json');

    const author = await prisma.author.findUnique({
      where: { id: body.authorId },
      select: { id: true },
    });

    if (!author) {
      return c.json({ error: 'Author not found' }, 400);
    }

    const slug = await createUniqueSlug(body.title);

    const created = await prisma.news.create({
      data: {
        slug,
        title: xss(body.title),
        excerpt: xss(body.excerpt),
        content: xss(body.content),
        published: body.published,
        authorId: body.authorId,
      },
      include: { author: true },
    });

    return c.json(created, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/:slug', zValidator('json', newsUpdateSchema), async (c) => {
  try {
    const slugParam = c.req.param('slug');
    const existing = await prisma.news.findUnique({ where: { slug: slugParam } });

    if (!existing) {
      return c.json({ error: 'News not found' }, 404);
    }

    const body = c.req.valid('json');

    if (body.authorId !== undefined) {
      const author = await prisma.author.findUnique({
        where: { id: body.authorId },
        select: { id: true },
      });
      if (!author) return c.json({ error: 'Author not found' }, 400);
    }

    const nextSlug =
      body.title !== undefined ? await createUniqueSlug(body.title, existing.id) : existing.slug;

    const updated = await prisma.news.update({
      where: { id: existing.id },
      data: {
        slug: nextSlug,
        ...(body.title !== undefined ? { title: xss(body.title) } : {}),
        ...(body.excerpt !== undefined ? { excerpt: xss(body.excerpt) } : {}),
        ...(body.content !== undefined ? { content: xss(body.content) } : {}),
        ...(body.authorId !== undefined ? { authorId: body.authorId } : {}),
        ...(body.published !== undefined ? { published: body.published } : {}),
      },
      include: { author: true },
    });

    return c.json(updated, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    const existing = await prisma.news.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return c.json({ error: 'News not found' }, 404);
    }

    await prisma.news.delete({ where: { id: existing.id } });
    return c.body(null, 204);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});