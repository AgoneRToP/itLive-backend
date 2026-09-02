import { Module } from "@nestjs/common";
import { AssistantsService } from "./assistants.service";
import { AssistantsController } from "./assistants.controller";

@Module({
  providers: [AssistantsService],
  controllers: [AssistantsController],
})
export class AssistantsModule {}
