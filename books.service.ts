import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

export interface FindBooksParams {
  genreId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    await this.ensureGenreExists(dto.genreId);
    try {
      return await this.prisma.book.create({
        data: { ...dto, copiesAvailable: dto.totalCopies },
        include: { genre: true },
      });
    } catch (e) {
      this.handleUnique(e);
      throw e;
    }
  }

  async findAll({ genreId, search, page = 1, limit = 10 }: FindBooksParams) {
    const where: Prisma.BookWhereInput = {};

    if (genreId) {
      where.genreId = genreId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        include: { genre: true },
        orderBy: { title: 'asc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    const existing = await this.findOne(id);
    if (dto.genreId) await this.ensureGenreExists(dto.genreId);

    const data: Prisma.BookUncheckedUpdateInput = { ...dto };

    // Keep copiesAvailable consistent when totalCopies changes
    if (dto.totalCopies !== undefined) {
      const checkedOut = existing.totalCopies - existing.copiesAvailable;
      if (dto.totalCopies < checkedOut) {
        throw new BadRequestException(
          `totalCopies cannot be less than the ${checkedOut} copies currently checked out`,
        );
      }
      data.copiesAvailable = dto.totalCopies - checkedOut;
    }

    try {
      return await this.prisma.book.update({
        where: { id },
        data,
        include: { genre: true },
      });
    } catch (e) {
      this.handleUnique(e);
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }

  private async ensureGenreExists(genreId: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id: genreId } });
    if (!genre) throw new BadRequestException(`Genre ${genreId} does not exist`);
  }

  private handleUnique(e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      throw new ConflictException('A book with that ISBN already exists');
    }
  }
}
