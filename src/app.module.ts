/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { UserPostModule } from './user-post/user-post.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_LOCAL_CONNECTION_URL),
    UserModule,
    UserPostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
