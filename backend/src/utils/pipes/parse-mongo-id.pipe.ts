import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Pipe personalizado que valida si un string es un Mongo ID válido.
 */
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, Types.ObjectId> {

  transform(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`"${value}" no es un ID de Mongo válido`);
    }
    // Devolvemos el valor casteado a ObjectId para que Mongoose lo entienda,
    // aunque en la práctica NestJS ya lo pasaba como string.
    // Lo importante es la validación.
    return new Types.ObjectId(value);
  }
}