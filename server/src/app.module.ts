import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { configuration } from './config/configuration';
import { EstimateModule } from './estimate/Estimate.module';
import { FlowIdMiddleware } from './logging/flow-id.middleware';
import { LoggerModule } from './logging/logger.module';
import { RequestLoggerMiddleware } from './logging/request-logger.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                return {
                    uri: configService.get('DB_CONNECTION_STRING'),
                };
            },
            inject: [ConfigService],
        }),
        EstimateModule,
        LoggerModule,
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).forRoutes('*');
        consumer.apply(FlowIdMiddleware).forRoutes('*');
    }
}