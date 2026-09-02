import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import axios from "axios";
import { RedisService } from "src/common/redis/redis.service";
import { normalizePhoneNumber } from "src/utils/phone";

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
    private readonly token = process.env.TELEGRAM_BOT_TOKEN;
    private readonly apiBase = `https://api.telegram.org/bot${this.token}`;
    private isPolling = false;
    private offset = 0;

    constructor(private readonly RedisService: RedisService) { }

    async onModuleInit() {
        if (!this.token) {
            console.warn('⚠️ TELEGRAM_BOT_TOKEN is not found in "env". Telegram bot service disabled.');
            return;
        }
        this.isPolling = true;
        this.startPolling();
    }

    async onModuleDestroy() {
        this.isPolling = false;
    }

    private async startPolling() {
        console.log('🤖 Telegram Bot long polling started...');
        while (this.isPolling) {
            try {
                const response = await axios.get(`${this.apiBase}/getUpdates`, {
                    params: {
                        offset: this.offset,
                        timeout: 20,
                    },
                    timeout: 25000,
                });

                const updates = response.data?.result || [];
                for (const update of updates) {
                    this.offset = update.update_id + 1;
                    await this.handleUpdate(update);
                }
            } catch (error: any) {
                console.error('Error in Telegram bot polling:', error.message);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }

    private async handleUpdate(update: any) {
        const message = update.message;
        if (!message) return;

        const chatId = message.chat.id;

        if (message.contact) {
            const phone = normalizePhoneNumber(message.contact.phone_number);
            if (phone) {
                await this.generateAndSendOtp(chatId, phone);
            } else {
                await this.sendMessage(chatId, "Telefon raqami noto'g'ri formatda. Iltimos, qaytadan yuboring.");
            }
            return;
        }

        if (message.text) {
            const text = message.text.trim();

            if (text.startsWith('/start')) {
                await this.sendGreeting(chatId);
                return;
            }

            await this.sendMessage(chatId, "❌ Kechirasiz, raqamni qo'lda yozib yuborish mumkin emas.\n" +
                "Iltimos, pastdagi **'📱 Telefon raqamni yuborish'** tugmasini bosing!", {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: '📱 Telefon raqamni yuborish',
                                request_contact: true,
                            },
                        ],
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
        }
    }

    private async sendGreeting(chatId: number) {
        await this.sendMessage(
            chatId,
            "Assalomu alaykum! LMS platformasiga ro'yxatdan o'tish uchun telefon raqamingizni yuboring. Tasdiqlash kodi shu raqam uchun Telegram orqali yuboriladi.",
            {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: '📱 Telefon raqamni yuborish',
                                request_contact: true,
                            },
                        ],
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            }
        );
    }

    private async generateAndSendOtp(chatId: number, phone: string) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const redisKey = `reg_${phone}`;

        await this.RedisService.set(redisKey, otp, 300);

        const text = `Sizning tasdiqlash kodingiz: *${otp}*\n\nUshbu kodni ro'yxatdan o'tish sahifasiga kiriting. Kod 5 daqiqa davomida faol bo'ladi.`;
        await this.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    }

    private async sendMessage(chatId: number, text: string, extra: any = {}) {
        try {
            await axios.post(`${this.apiBase}/sendMessage`, {
                chat_id: chatId,
                text,
                ...extra,
            });
        } catch (error: any) {
            console.error(`Error sending message to chatId ${chatId}:`, error.message);
        }
    }

}
