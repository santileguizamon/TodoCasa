import { Test, TestingModule } from '@nestjs/testing';
import { TrabajosService } from './trabajos.service';

describe('TrabajosService', () => {
  let service: TrabajosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrabajosService],
    }).compile();

    service = module.get<TrabajosService>(TrabajosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
