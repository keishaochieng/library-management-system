import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

const COPIES = 3;
const SEED_PASSWORD = 'Password123'; // dev/test only

async function main() {
  let counter = 1;

  for (const [genreName, books] of Object.entries(catalog)) {
    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });

    for (const [title, author, publishedYear] of books) {
      // Placeholder ISBNs (unique, clearly fake). Replace with real ones if you have them.
      const isbn = `SEED-ISBN-${String(counter++).padStart(4, '0')}`;

      await prisma.book.upsert({
        where: { title_author: { title, author } },
        update: {},
        create: {
          title,
          author,
          isbn,
          publishedYear,
          totalCopies: COPIES,
          copiesAvailable: COPIES,
          genreId: genre.id,
        },
      });
    }
  }

  const password = await bcrypt.hash(SEED_PASSWORD, 10);

  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@library.test' },
    update: { password },
    create: {
      email: 'librarian@library.test',
      name: 'Lina Librarian',
      password,
      role: Role.LIBRARIAN,
    },
  });
  const patron = await prisma.user.upsert({
    where: { email: 'patron@library.test' },
    update: { password },
    create: {
      email: 'patron@library.test',
      name: 'Paul Patron',
      password,
      role: Role.PATRON,
    },
  });

  const book = await prisma.book.findFirstOrThrow({ where: { title: 'Things Fall Apart' } });
  await prisma.review.upsert({
    where: { bookId_userId: { bookId: book.id, userId: patron.id } },
    update: {},
    create: { bookId: book.id, userId: patron.id, rating: 5, comment: 'A timeless classic.' },
  });

  console.log(
    `Seeded 4 genres, 16 books, users: ${librarian.email}, ${patron.email} (password: ${SEED_PASSWORD})`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
