import { Test, TestingModule } from '@nestjs/testing';
import { ProfesionalesService } from './profesionales.service';

describe('ProfesionalesService', () => {
  let service: ProfesionalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfesionalesService],
    }).compile();

    service = module.get<ProfesionalesService>(ProfesionalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
