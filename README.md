## Required Files (for reviewers)

| Requirement | Path |
|---|---|
| Prisma schema (Role enum, User, Genre, Book, Review) | `api/prisma/schema.prisma` |
| Seed script (4 genres, 16 books) | `api/prisma/seed.ts` |
| Prisma service (extends PrismaClient, OnModuleInit, `$connect()`) | `api/src/prisma/prisma.service.ts` |
| Env placeholder | `api/.env.example` |
| Migration | `api/prisma/migrations/20261102033111_init/migration.sql` |

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
