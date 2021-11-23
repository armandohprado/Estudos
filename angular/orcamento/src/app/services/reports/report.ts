import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { isNil } from 'lodash-es';
import { environment } from '../../../environments/environment';

export enum ReportsOptionsEnum {
  toolbar = 'rc:Toolbar',
  format = 'rs:Format',
  command = 'rs:Command',
  clearSession = 'rs:ClearSession',
}

const DEFAULT_PARAMS = {
  toolbar: false,
  clearSession: true,
  command: 'Render',
  format: 'PDF',
};

export class Report {
  constructor(
    private window: Window,
    private domSanitizer: DomSanitizer,
    private reportName: string,
    params: Record<string, any>
  ) {
    this._params = { ...DEFAULT_PARAMS, ...params };
  }

  private _params: Record<string, any>;

  getUrl(): string {
    return Object.entries(this._params)
      .filter(([_, value]) => !isNil(value))
      .reduce((acc, [key, value]) => {
        const newKey = ReportsOptionsEnum[key] ?? key;
        return acc + `&${newKey}=${value}`;
      }, environment.reports + this.reportName);
  }

  getParams(): Record<string, any> {
    return { ...this._params };
  }

  hasParam(name: string): boolean {
    return !isNil(this._params[name]);
  }

  getParam(name: string): string | number | undefined {
    return this._params[name];
  }

  setParam(name: string, value: string | number): this {
    this._params = { ...this._params, [name]: value };
    return this;
  }

  getUrlAndParams(): [string, Record<string, any>] {
    return [this.getUrl(), this.getParams()];
  }

  getUrlBypassSecurity(): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(this.getUrl());
  }

  open(blank = true, options = ''): void {
    this.window.open(this.getUrl(), blank ? '_blank' : undefined, options);
  }
}
