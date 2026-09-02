import { PartialType } from "@nestjs/swagger";
import { CreateMentorDto } from "./mentor-create.dto";

export class UpdateMentorDto extends PartialType(CreateMentorDto) {}
