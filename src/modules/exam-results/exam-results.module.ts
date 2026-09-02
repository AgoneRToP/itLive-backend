import { Module } from "@nestjs/common";
import { ExamResultsService } from "./exam-results.service";
import { ExamResultsController } from "./exam-results.controller";
import { PrismaModule } from "src/core/database/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [ExamResultsController],
    providers: [ExamResultsService],
    exports: [ExamResultsService],
})
export class ExamResultsModule {}


