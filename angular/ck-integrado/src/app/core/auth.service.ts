import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private cookieService: CookieService) {}

  getToken(): string {
    let token = this.cookieService.get('aw_auth_token');
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !token) {
      token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6WyJndWlsaGVybWUucGFpcyIsImd1aWxoZXJtZS5wYWlzIl0sImp0aSI6IjFmMzQ1YzQyMDhhNzQ2ZTZiNzU2NzdjZDkxMDVmZmY2IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc2lkIjoiZnVuXzQxNjgiLCJuYmYiOjE2MTI5NTc0MTQsImV4cCI6MTYyODU5NTgxNCwiaWF0IjoxNjEyOTU3NDE3LCJpc3MiOiJBd25ldEZvY3VzSXNzdWVyIiwiYXVkIjoiQXduZXRGb2N1c0F1ZGllbmNlIn0.JsKMb07DYP3LoDGeU5gt3-aXXbzQooiSACAiBWhcxAA';
    }
    return token;
  }
}
