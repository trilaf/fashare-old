import { TestBed } from '@angular/core/testing';

import { ReceiverService } from './receiver.service';

describe('ReceiverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReceiverService = TestBed.get(ReceiverService);
    expect(service).toBeTruthy();
  });
});
