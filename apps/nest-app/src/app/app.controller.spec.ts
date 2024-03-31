import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from '../logger/logger.module';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            generateId: true,
            idGenerator: () => 'ABC',
          },
        }),
        LoggerModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
