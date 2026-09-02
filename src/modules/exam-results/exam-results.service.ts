import { PrismaService } from "src/core/database/prisma.service";
import { ExamResultsDto } from "./dto/exam-results.dto";

export class ExamResultsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: ExamResultsDto) {
        const { search, startDate, endDate, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

    const where:any = {}
      if(search){
        where.user = {
          fullName:{
            contains:search,
            mode:'insensitive'
          },
        };
      }
      if(startDate || endDate){
        where.created_at = {}
        if(startDate){
          where.created_at.gte =new Date(startDate)
        }
        if(endDate){
          const end = new Date(endDate)
          end.setHours(23,59,59,999)
          where.created_at.lte = end
        }
      }
      const [total, results] = await Promise.all([
          this.prisma.examResults.count({ where }),
          this.prisma.examResults.findMany({
              where,
              skip,
              take: limit,
              orderBy: { created_at: "desc" },
              include: {
                  user: {
                      select: {
                          id: true,
                          fullName: true,
                          file: true,
                      },
                  },
                  lessons: {
                      select: {
                          id: true,
                          name: true, 
                          sections: {
                              select: {
                                  name: true,
                                  courses: {
                                      select: {
                                          name: true, 
                                      },
                                  },
                              },
                          },
                      },
                  },
              },
          }),
      ]);
      const formattedData = results.map((item) => ({
          id: item.id,
          student: {
              id: item.user.id,
              fullName: item.user.fullName,
              file: item.user.file,
          },
          courseName: item.lessons.sections.courses.name,
          sectionName: item.lessons.sections.name + " - " + item.lessons.name,
          correctAnswers: item.correctAnswer,
          wrongAnswers: item.wrongAnswer,
          isPassed: item.isPassed,
          created_at: item.created_at,
      }));

      return {
          data: formattedData,
          meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
          },
      };
    }
}
