import { Module } from "@nestjs/common";
import { PrismaModule } from "./core/database/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { SeederModule } from "./core/seed/seeder.module";
import { CoursesModule } from "./modules/courses/courses.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { CourseAssistantModule } from "./modules/course-assistant/course-assistant.module";
import { AuthModule, SectionsModule } from "./modules";
import { MentorModule } from "./modules/mentor/mentor.module";
import { MaterialsModule } from "./modules/materials/materials.module";
import { LessonsModule } from "./modules/lessons/lessons.module";
import { UsersModule } from "./modules/users/users.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { CommentsModule } from "./modules/comments/comments.module";

import { HomeworksModule } from "./modules/homeworks/homeworks.module";
import { StudentsModule } from "./modules/students/students.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ExamModule } from "./modules/exam/exam.module";
import { RedisModule } from "./common/redis/redis.module";
import { BotModule } from "./modules/telegram/bot.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AssistantsModule } from "./modules/assistants/assistants.module";
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CourseCommentsModule } from './modules/course-comments/course-comments.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/uploads",
    }),
    PrismaModule,
    SeederModule,
    AuthModule,
    UsersModule,
    MentorModule,
    LessonsModule,
    ProfileModule,
    MaterialsModule,
    CategoriesModule,
    CoursesModule,
    SectionsModule,
    LessonsModule,
    AssistantsModule,
    CourseAssistantModule,
    CommentsModule,
    HomeworksModule,
    StudentsModule,
    PaymentsModule,
    ExamModule,
    RedisModule,
    BotModule,
    NotificationsModule,
    CourseCommentsModule,
  ],
})
export class AppModule { }
