import { animate, style, transition, trigger } from '@angular/animations';

export const collapseAnimation = (ms = 400, type = 'cubic-bezier(0.4,0.0,0.2,1)') =>
  trigger('collapse', [
    transition(':leave', [style({ overflow: 'hidden' }), animate(`${ms}ms ${type}`, style({ height: '0px' }))]),
    transition(':enter', [
      style({ height: 0, overflow: 'hidden' }),
      animate(`${ms}ms ${type}`, style({ height: '*' })),
    ]),
  ]);
export const collapseNamedAnimation = (ms = 400, type = 'cubic-bezier(0.4,0.0,0.2,1)') =>
  trigger('collapseNamed', [
    transition('* => collapsed', [style({ overflow: 'hidden' }), animate(`${ms}ms ${type}`, style({ height: '0px' }))]),
    transition('* => opened', [
      style({ height: 0, overflow: 'hidden' }),
      animate(`${ms}ms ${type}`, style({ height: '*' })),
    ]),
  ]);

export const skipFirstAnimation = () => trigger('skipFirstAnimation', [transition(':enter', [])]);
