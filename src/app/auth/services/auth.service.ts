import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type {
  AuthResponse,
  CreateUserDTO,
} from '@auth/interfaces/auth-response.interface';
import { User } from '@auth/interfaces/user.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const BASE_URL = environment.baseUrl;
const TOKEN_KEY = 'token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _authStatus = signal<AuthStatus>('checking');
  private readonly _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  private readonly _http = inject(HttpClient);

  checkStatusResource = rxResource({
    loader: () => this.checkAuthStatus(),
  });

  // recuerda que los computed signal son de solo lectura
  authStatus = computed<AuthStatus>(() => {
    return this._authStatus() === 'checking'
      ? 'checking'
      : this._user()
      ? 'authenticated'
      : 'not-authenticated';
  });

  user = computed(() => this._user());
  token = computed(this._token);

  login(email: string, password: string): Observable<boolean> {
    return this._http
      .post<AuthResponse>(BASE_URL.concat('/auth/login'), { email, password })
      .pipe(
        map((resp) => this._handleAuthSuccess(resp)),
        catchError(({ error }) => this._handleAuthError(error))
        // console.error('Error on Auth Service: ', error.message);
        // this._user.set(null);
        // this._token.set(null);
        // this._authStatus.set('not-authenticated'); // Esto no harría falta por la señak computada
        // return of(false);
      );
  }

  register(userDTO: CreateUserDTO): Observable<boolean> {
    return this._http
      .post<AuthResponse>(BASE_URL.concat('/auth/register'), userDTO)
      .pipe(
        map((resp) => this._handleAuthSuccess(resp)),
        catchError(({ error }) => this._handleAuthError(error))
      );
  }
  checkAuthStatus(): Observable<boolean> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      this.logout();
      return of(false);
    }

    return this._http
      .get<AuthResponse>(BASE_URL.concat('/auth/check-status'), {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      })
      .pipe(
        map((resp) => this._handleAuthSuccess(resp)),
        catchError(({ error }) => this._handleAuthError(error))
      );
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    localStorage.removeItem(TOKEN_KEY);
  }

  private _handleAuthSuccess({ token, user }: AuthResponse): boolean {
    this._user.set(user);
    this._token.set(token);
    this._authStatus.set('authenticated');

    // Save token on local storage
    localStorage.setItem(TOKEN_KEY, token);

    return true;
  }

  private _handleAuthError(error: any): Observable<boolean> {
    console.error('Error on Auth Service: ', error.message);
    this.logout();
    return of(false);
  }
}
