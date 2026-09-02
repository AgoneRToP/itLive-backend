import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis | null = null;
    private isConnected = false;
    private readonly logger = new Logger('RedisService');

    async onModuleInit() {
        try {
            this.client = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT || 6379),
                lazyConnect: true,
                enableReadyCheck: false,
                maxRetriesPerRequest: null,
                connectTimeout: 5000,
                retryStrategy(times) {
                    if (times > 3) {
                        return null;
                    }
                    return Math.min(times * 300, 2000);
                },
            });

            this.client.on('connect', () => {
                this.isConnected = true;
                this.logger.log('✅ Redis Connected');
            });

            this.client.on('error', (err) => {
                this.isConnected = false;
                this.logger.warn(`⚠️ Redis Error: ${err.message}`);
            });

            this.client.on('close', () => {
                this.isConnected = false;
                this.logger.warn('⚠️ Redis Connection Closed');
            });

            await this.client.connect();
        } catch (error) {
            this.logger.warn('⚠️ Redis initialization failed - proceeding without cache');
            this.client = null;
            this.isConnected = false;
        }
    }

    async onModuleDestroy() {
        try {
            if (this.client) {
                await this.client.quit();
            }
        } catch (error) {
            this.logger.error('Error disconnecting Redis:', error);
        }
    }

    async set(key: string, value: string, seconds: number) {
        if (!this.client || !this.isConnected) {
            return null;
        }
        try {
            return await this.client.set(key, value, 'EX', seconds);
        } catch (error) {
            this.logger.warn(`Error setting Redis key ${key}`);
            return null;
        }
    }

    async get(key: string) {
        if (!this.client || !this.isConnected) {
            return null;
        }
        try {
            return await this.client.get(key);
        } catch (error) {
            this.logger.warn(`Error getting Redis key ${key}`);
            return null;
        }
    }

    async del(key: string) {
        if (!this.client || !this.isConnected) {
            return null;
        }
        try {
            return await this.client.del(key);
        } catch (error) {
            this.logger.warn(`Error deleting Redis key ${key}`);
            return null;
        }
    }
}
