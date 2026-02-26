import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.news.deleteMany();
    await prisma.author.deleteMany();

    const authors = await prisma.$transaction([
        prisma.author.create({ data: { name: 'author one', email: 'author1@example.org' } }),
        prisma.author.create({ data: { name: 'author two', email: 'author2@example.org' } }),
        prisma.author.create({ data: { name: 'author three', email: 'author3@example.com' } }),
        prisma.author.create({ data: { name: 'author four', email: 'author4@example.com' } }),
        prisma.author.create({ data: { name: 'author five', email: 'author5@example.com' } }),
        prisma.author.create({ data: { name: 'author six', email: 'author6@example.com' } }),
        prisma.author.create({ data: { name: 'author seven', email: 'author7@example.com' } }),
        prisma.author.create({ data: { name: 'author eight', email: 'author8@example.com' } }),
        prisma.author.create({ data: { name: 'author nine', email: 'author9@example.com' } }),
    ]);

    const newsItems = Array.from({ length: 12 }, (_, i) => ({
        slug: `frett-${i + 1}`,
        title: `Frétt númer ${i + 1}`,
        excerpt: `Stuttur útdráttur fyrir frétt ${i + 1}.`,
        content: `Lengra efni fyrir frétt ${i + 1}. Lorem ipsum ...`,
        published: i % 2 === 0,
        authorId: authors[i % authors.length]!.id,
    }));

  await prisma.news.createMany({ data: newsItems });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });