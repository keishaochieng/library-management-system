import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  isbn: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalCopies: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  genreId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  publishedYear?: number;
}
