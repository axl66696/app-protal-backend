import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NatsJetStreamServer } from './jetstream/jetstream.service';
import { readdirSync } from 'fs';
import { ConsumerMeta } from './types';

(async () => {
  // 連線至NATS
  const app = await NestFactory.createApplicationContext(AppModule);
  const appService = app.get(NatsJetStreamServer);
  await appService.connect();

  // 抓取資料夾
  const srcFiles = readdirSync(__dirname);
  const folders = srcFiles.filter((filename) => !filename.includes('.'));

  // 找出每個Controller檔案
  const controllerFiles = folders.map((folder) => {
    const folderDir = `${__dirname}/${folder}`;
    const files = readdirSync(folderDir);
    const controllerFile = files.find(
      (file) => file.includes('controller') && !file.includes('controller.d'),
    );

    return controllerFile && `${__dirname}/${folder}/${controllerFile}`;
  });
  const foundControllerFiles = controllerFiles.filter((x) => x);

  // 訂閱每個Controller的主題
  foundControllerFiles.forEach(async (file) => {
    const ControllerModule = await import(file);
    const ControllerClass = ControllerModule.default;
    if (!ControllerClass) return;

    const controller = new ControllerClass();
    const subjectPrefix = Reflect.getMetadata('subjectPrefix', ControllerClass);
    const consumers =
      (Reflect.getMetadata('consumers', controller) as ConsumerMeta[]) || [];

    // 訂閱並根據主題分配工作
    appService.subscribeMessage(subjectPrefix, (message, payload) => {
      const shortSubject = message.subject.split(`${subjectPrefix}.`)[1];
      const foundConsumer = consumers.find((x) => x.subject === shortSubject);
      if (!foundConsumer) return;

      controller[foundConsumer.methodName](message, payload);
    });

    console.log(`Listening on subject ${subjectPrefix}.>`);
  });
})();
