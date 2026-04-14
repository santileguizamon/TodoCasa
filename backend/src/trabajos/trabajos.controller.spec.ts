import { Test, TestingModule } from '@nestjs/testing';
import { TrabajosController } from './trabajos.controller';

describe('TrabajosController', () => {
  let controller: TrabajosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrabajosController],
    }).compile();

    controller = module.get<TrabajosController>(TrabajosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
