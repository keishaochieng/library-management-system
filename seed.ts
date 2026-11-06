import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

type BookSeed = [title: string, author: string, year: number];

const catalog: Record<string, BookSeed[]> = {
  Fiction: [
    ['Things Fall Apart', 'Chinua Achebe', 1958],
    ['Half of a Yellow Sun', 'Chimamanda Ngozi Adichie', 2006],
    ['The River Between', "Ngũgĩ wa Thiong'o", 1965],
    ['Weep Not, Child', "Ngũgĩ wa Thiong'o", 1964],
  ],
  Science: [
    ['A Brief History of Time', 'Stephen Hawking', 1988],
    ['Cosmos', 'Carl Sagan', 1980],
    ['The Selfish Gene', 'Richard Dawkins', 1976],
    ['Silent Spring', 'Rachel Carson', 1962],
  ],
  Technology: [
    ['Clean Code', 'Robert C. Martin', 2008],
    ['The Pragmatic Programmer', 'Andrew Hunt and David Thomas', 1999],
    ['Designing Data-Intensive Applications', 'Martin Kleppmann', 2017],
    ['Introduction to Algorithms', 'Thomas H. Cormen et al.', 1990],
  ],
  History: [
    ['Long Walk to Freedom', 'Nelson Mandela', 1994],
    ['Sapiens', 'Yuval Noah Harari', 2011],
    ['Guns, Germs, and Steel', 'Jared Diamond', 1997],
    ['Facing Mount Kenya', 'Jomo Kenyatta', 1938],
  ],
};

async function main() {
  for (const [genreName, books] of Object.entries(catalog)) {
    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });

    for (const [title, author, publishedYear] of books) {
      await prisma.book.upsert({
        where: { title_author: { title, author } },
        update: {},
        create: {
          title,
          author,
          publishedYear,
          copiesAvailable: 3,
          genreId: genre.id,
        },
      });
    }
  }

  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@library.test' },
    update: {},
    create: { email: 'librarian@library.test', name: 'Lina Librarian', role: Role.LIBRARIAN },
  });
  const patron = await prisma.user.upsert({
    where: { email: 'patron@library.test' },
    update: {},
    create: { email: 'patron@library.test', name: 'Paul Patron', role: Role.PATRON },
  });

  const book = await prisma.book.findFirstOrThrow({ where: { title: 'Things Fall Apart' } });
  await prisma.review.upsert({
    where: { bookId_userId: { bookId: book.id, userId: patron.id } },
    update: {},
    create: { bookId: book.id, userId: patron.id, rating: 5, comment: 'A timeless classic.' },
  });

  console.log(`Seeded 4 genres, 16 books, users: ${librarian.email}, ${patron.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());