import { animate, style, transition, trigger } from '@angular/animations';

export const fadeOutAnimation = (ms = 200) =>
  trigger('fadeOut', [transition(':leave', [animate(ms, style({ opacity: 0 }))])]);

export const fadeInOutAnimation = (ms = 200) =>
  trigger('fadeInOut', [
    transition(':enter', [style({ opacity: 0 }), animate(ms, style({ opacity: 1 }))]),
    transition(':leave', [animate(ms, style({ opacity: 0 }))]),
  ]);
