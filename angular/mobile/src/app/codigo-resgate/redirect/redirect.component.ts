import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AwMobileService } from '../codigo-resgate.service';

@Component({
  selector: 'app-redirect',
  template: ` {{ mensagem$ | async }}`,
  styles: [
    ':host{ background: #c92800;margin: 0 auto;color: white;display: block;max-width: 50%;padding: 10px;text-align: center;} ',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectComponent {
  constructor(private awMobileService: AwMobileService) {}
  mensagem$ = this.awMobileService.mensagemErroCodResgate$;
}
