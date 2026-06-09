import { TestBed } from '@angular/core/testing';

import { Heartbeat } from './heartbeat';

describe('Heartbeat', () => {
  let service: Heartbeat;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Heartbeat);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
