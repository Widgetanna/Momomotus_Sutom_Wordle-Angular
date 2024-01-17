import { TestBed } from '@angular/core/testing';

import { ServiceSutomService } from './service-sutom.service';

describe('ServiceSutomService', () => {
  let service: ServiceSutomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceSutomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
