- [schema.prisma](https://github.com/keishaochieng/library-management-system/blob/main/api/prisma/schema.prisma)
- [seed.ts](https://github.com/keishaochieng/library-management-system/blob/main/api/prisma/seed.ts)
- [prisma.service.ts](https://github.com/keishaochieng/library-management-system/blob/main/api/src/prisma/prisma.service.ts)
- [.env.example](https://github.com/keishaochieng/library-management-system/blob/main/api/.env.example)

## Required Files (for reviewers)

| Requirement | File |
|---|---|
| Prisma schema (Role enum, User, Genre, Book, Review) | [api/prisma/schema.prisma](api/prisma/schema.prisma) |
| Seed script (4 genres, 16 books) | [api/prisma/seed.ts](api/prisma/seed.ts) |
| Prisma service (extends PrismaClient, OnModuleInit, `$connect()`) | [api/src/prisma/prisma.service.ts](api/src/prisma/prisma.service.ts) |
| Env placeholder | [api/.env.example](api/.env.example) |
| Migration | [api/prisma/migrations/20261102033111_init/migration.sql](api/prisma/migrations/20261102033111_init/migration.sql) |

This repo’s data layer lives in api/: see api/prisma/schema.prisma, api/prisma/seed.ts, api/src/prisma/prisma.service.ts and api/.env.example.

> Copies of the four key files also sit at the repo root for easy viewing. The working originals are in `api/` at the paths above.

# Library Management System

NestJS + Prisma + PostgreSQL backend for a library book catalog.

## Setup

```bash
cd api
npm install
cp .env.example .env      # then put your real DATABASE_URL in .env
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

## Schema Decisions

**Why `Book` references `Genre` instead of embedding it**

- **One source of truth.** A genre like "Science" is shared by many books.
  If it were embedded inside each book, renaming a genre would mean updating
  every book, and a typo in one copy ("Sceince") would create a silent
  duplicate genre.
- **Referential integrity.** `Book.genreId` is a foreign key, so the database
  rejects a book pointing to a genre that doesn't exist.
- **Efficient queries.** "All books in a genre" or "how many books per genre"
  is a simple indexed lookup on `genreId` rather than scanning and
  string-matching every book.
- **Normalized and extensible.** A Genre can later gain its own fields
  (description, shelf location) without touching the Book table.

**Other decisions**

- `Role` is an enum (`PATRON`, `LIBRARIAN`) so invalid roles are impossible.
- `@@unique([title, author])` prevents duplicate catalog entries and makes the
  seed script idempotent.
- `@@unique([bookId, userId])` on `Review` allows one review per user per book.
- `Review` uses `onDelete: Cascade` so deleting a book or user removes their reviews.

## Prisma vs. a document database

In a document database like MongoDB I would have been tempted to embed the
genre (and even reviews) inside each book document, with no upfront schema.
In Prisma I had to declare the structure first, model every relationship
explicitly, and let the database enforce it. It felt stricter at the start,
but it made data consistency and relations much easier to reason about.

## Source Code Reference

Full contents of the required files (also present at these paths in the repo).

### `api/prisma/schema.prisma`

```

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  PATRON
  LIBRARIAN
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  role      Role     @default(PATRON)
  createdAt DateTime @default(now())

  reviews   Review[]
}

model Genre {
  id    Int    @id @default(autoincrement())
  name  String @unique

  books Book[]
}

model Book {
  id              Int      @id @default(autoincrement())
  title           String
  author          String
  publishedYear   Int?
  copiesAvailable Int      @default(1)
  createdAt       DateTime @default(now())

  genreId         Int
  genre           Genre    @relation(fields: [genreId], references: [id])

  reviews         Review[]

  @@unique([title, author])
  @@index([genreId])
}

// Stretch task
model Review {
  id        Int      @id @default(autoincrement())
  rating    Int
  comment   String?
  createdAt DateTime @default(now())

  bookId    Int
  book      Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)

  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([bookId, userId])
}
```

### `api/prisma/seed.ts`

```
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
```

### `api/src/prisma/prisma.service.ts`

```
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### `api/.env.example`

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
```

### `api/prisma/migrations/20261102033111_init/migration.sql`

```
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATRON', 'LIBRARIAN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PATRON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishedYear" INTEGER,
    "copiesAvailable" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE INDEX "Book_genreId_idx" ON "Book"("genreId");

-- CreateIndex
CREATE UNIQUE INDEX "Book_title_author_key" ON "Book"("title", "author");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookId_userId_key" ON "Review"("bookId", "userId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Assignment files
Copies of the graded files are at the repo root for review. The originals are in api/src (genres, books, auth, users, main.ts). The Postman collection is docs/postman_collection.json.
