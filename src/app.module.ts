import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsJetStreamServer } from './services/jetstream.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, NatsJetStreamServer],
})
export class AppModule {}
