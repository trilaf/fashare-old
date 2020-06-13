import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextSenderComponent } from './text-sender.component';

describe('TextSenderComponent', () => {
  let component: TextSenderComponent;
  let fixture: ComponentFixture<TextSenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextSenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextSenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
