/* tslint:disable:no-console */
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { enableAkitaProdMode } from '@datorama/akita';

declare global {
  const ngDevMode: any;
}

function insertAwSpinner(): void {
  document.querySelector('app-root').innerHTML = `
    <div class="aw-spinner__overlay aw-spinner__overlay--fullscreen">
      <div class="aw-spinner aw-spinner--medium">
        <div class="aw-spinner__internal"></div>
      </div>
    </div>
  `;
}

if (/MSIE|Trident/.test(window.navigator.userAgent)) {
  // Se for IE, não carregar a aplicação
  document.body.querySelector('app-root').innerHTML = `
    <div class="container pt-5">
      <div class="d-column-flex text-center">
        <h1>Atenção</h1>
        <p>O sistema do Novo Focus não dá mais suporte para este navegador. <br />
          Copie o endereço abaixo e abra com o navegador Google Chrome.
        </p>
        <p>${window.location.href}</p>
      </div>
    </div>
  `;
} else {
  insertAwSpinner();

  if (environment.build) {
    enableProdMode();
    enableAkitaProdMode();
  }

  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
}
