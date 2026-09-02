import { Module } from "@nestjs/common";
import { ExamController } from "./exam.controller";
import { ExamService } from "./exam.service";
import { PrismaModule } from "../../core/database/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { ExamGateway } from "./exam.gateway";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ExamController],
  providers: [ExamService, ExamGateway],
})
export class ExamModule {}
