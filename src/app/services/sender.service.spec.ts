import { TestBed } from '@angular/core/testing';

import { SenderService } from './sender.service';

describe('SenderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SenderService = TestBed.get(SenderService);
    expect(service).toBeTruthy();
  });
});
