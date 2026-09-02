import { Module } from "@nestjs/common";
import { StudentService } from "./students.service";
import { StudentController } from "./students.controller";

@Module({
    providers: [StudentService],
    controllers: [StudentController],
})
export class StudentsModule {}