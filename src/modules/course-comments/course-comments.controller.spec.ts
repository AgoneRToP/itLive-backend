import { Test, TestingModule } from '@nestjs/testing';
import { CourseCommentsController } from './course-comments.controller';

describe('CourseCommentsController', () => {
  let controller: CourseCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseCommentsController],
    }).compile();

    controller = module.get<CourseCommentsController>(CourseCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
