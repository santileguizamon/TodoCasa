import { Test, TestingModule } from '@nestjs/testing';
import { VerificacionController } from './verificacion.controller';
import { VerificacionService } from './verificacion.service';

describe('VerificacionController', () => {
  let controller: VerificacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificacionController],
      providers: [VerificacionService],
    }).compile();

    controller = module.get<VerificacionController>(VerificacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
