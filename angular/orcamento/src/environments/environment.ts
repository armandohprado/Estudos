// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  homolog: true,
  dev: true,
  ApiUrl: 'api-sciensa/',
  downloadUrl: 'api-sciensa/',
  fotoUrl: 'https://awintra.athiewohnrath.com.br/Download/Fotos/images/',
  AwApiUrl: 'api-aw/',
  reports: 'http://reportsprd.athiewohnrath.com.br/ReportServer/Pages/ReportViewer.aspx?%2fOrcamentoHLG%2f',
  build: false,
  ApiChaveRegistroUrl: 'api-chave-registro/',
  centralizacao: 'http://centralizacao.athiewohnrath.com.br/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
