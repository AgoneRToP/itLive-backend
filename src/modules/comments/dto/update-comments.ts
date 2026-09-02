import { PartialType } from "@nestjs/mapped-types";
import { CreateCommentsDto } from "./create-comments";

export class UpdateCommentsDto extends PartialType(CreateCommentsDto){}