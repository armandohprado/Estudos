import { AwPercentOfPipe } from './aw-percent-of.pipe';
import { inject, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';

describe('AwPercentOfPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule],
    });
  });

  it('Cria a instancia', inject([LOCALE_ID], locale => {
    const pipe = new AwPercentOfPipe(locale);
    expect(pipe).toBeTruthy();
  }));

  it('Deve retornar o valor convertido (number)', inject([LOCALE_ID], locale => {
    const pipe = new AwPercentOfPipe(locale);
    const value = 25;
    const base = 100;
    const piped = pipe.transform(value, base);
    expect(piped).toBe('25%');
  }));

  it('Deve retornar o valor convertido (string)', inject([LOCALE_ID], locale => {
    const pipe = new AwPercentOfPipe(locale);
    const value = '25';
    const base = '100';
    const piped = pipe.transform(value, base);
    expect(piped).toBe('25%');
  }));

  it('Deve retornar 0', inject([LOCALE_ID], locale => {
    const pipe = new AwPercentOfPipe(locale);
    const value = 'a';
    const base = '100';
    const piped = pipe.transform(value, base);
    expect(piped).toBe('0%');
  }));

  it('Deve retornar 0 (base com não-número', inject([LOCALE_ID], locale => {
    const pipe = new AwPercentOfPipe(locale);
    const value = '25';
    const base = 'a';
    const piped = pipe.transform(value, base);
    expect(piped).toBe('0%');
  }));
});
