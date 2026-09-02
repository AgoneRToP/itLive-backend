import { CreateLessonDto } from './create-lesson.dto';
import { PartialType } from '@nestjs/swagger';


export class UpdateLessonDto extends PartialType(CreateLessonDto) {}