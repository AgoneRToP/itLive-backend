import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { UserRoles } from "@prisma/client";
import * as argon from "argon2"

@Injectable()
export class UserSeeder implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        const existUser = await this.prisma.user.findFirst({
            where: {
                phone: "+998975661099"
            }
        })

        if (existUser) {
            Logger.log("✅ SuperAdmin alread exist")
        } else {
            await this.prisma.user.create({
                data: {
                    fullName: "Abduxoshim Sultonqulov",
                    phone: "+998975661099",
                    password: await argon.hash(process.env.ADMIN_PASSWORD as string),
                    role: UserRoles.SUPERADMIN
                }
            })

            Logger.log("✅ SuperAdmin Created")
        }
    }
}