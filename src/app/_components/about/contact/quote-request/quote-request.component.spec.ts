import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteRequestComponent } from './quote-request.component';

describe('QuoteRequestComponent', () => {
  let component: QuoteRequestComponent;
  let fixture: ComponentFixture<QuoteRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuoteRequestComponent]
    });
    fixture = TestBed.createComponent(QuoteRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
