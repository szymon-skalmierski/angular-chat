import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as SendBird from 'sendbird';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { environment as env } from 'src/environments/environment';

import { User } from './user.model';
import {
  LookupResponse,
  SignInWithPasswordResponse,
  SignUpResponse,
} from './firebase-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  sb: SendBird.SendBirdInstance;

  private tokenExpiratonTimer: string | number | NodeJS.Timeout | undefined;

  authError = new BehaviorSubject<SendBird.SendBirdError | null>(null);
  user = new BehaviorSubject<User | null | undefined>(undefined);

  constructor(private router: Router, private http: HttpClient) {
    this.sb = new SendBird({ appId: env.APP_ID });
    SendBird.setLogLevel(SendBird.LogLevel.ERROR);
  }

  login(email: string, password: string) {
    return this.http.post<SignInWithPasswordResponse>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.firebase_key}`,
      {
        email: email,
        password: password,
      }
    );
  }

  connect(userId: string, token: string) {
    return this.sb
      .connect(
        userId,
        '',
        (user: SendBird.User, error: SendBird.SendBirdError) => {
          if (user) {
            const expirationDate = new Date(
              new Date().getTime() + 60 * 60 * 1000
            );
            const userData = new User(userId, token, expirationDate);

            if (this.authError.value) {
              this.authError.next(null);
            }

            if (!localStorage.getItem('userData')) {
              localStorage.setItem('userData', JSON.stringify(userData));
              this.user.next(userData);
              this.autoLogout(
                new Date(+expirationDate).getTime() - new Date().getTime()
              );
            }
          } else if (error) {
            if (this.user.value) {
              this.logout();
            }
            this.authError.next(error);
          }
        }
      )
      .catch((err) => console.log(err));
  }

  getConnectedUserId() {
    return this.sb && this.sb.currentUser && this.sb.currentUser.userId;
  }

  getConnectedUser() {
    return this.sb && this.sb.currentUser ? this.sb.currentUser : null;
  }

  autoLogin() {
    if (!localStorage.getItem('userData')) {
      this.logout();
      return;
    }
    let userData;
    try {
      userData = JSON.parse(localStorage.getItem('userData')!);
    } catch (error) {
      this.logout();
      return;
    }

    const loadedUser = new User(
      userData.userId,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(+expirationDuration);

      this.http
        .post<LookupResponse>(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.firebase_key}`,
          {
            idToken: loadedUser.token,
          }
        )
        .subscribe((res: LookupResponse) => {
          if (loadedUser.userId !== res.users[0].displayName) {
            this.logout();
          } else {
            this.connect(loadedUser.userId, '');
            this.user.next(loadedUser);
          }
        });
    } else {
      this.logout();
    }
  }

  autoLogout(expirationTime: number) {
    this.tokenExpiratonTimer = setTimeout(() => {
      this.logout();
    }, expirationTime);
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    this.sb.disconnect();
    if (this.tokenExpiratonTimer) {
      clearTimeout(this.tokenExpiratonTimer);
    }
    this.tokenExpiratonTimer = undefined;
  }

  signup(email: string, password: string) {
    return this.http
      .post<SignUpResponse>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${env.firebase_key}`,
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError((errorRes) => {
          let errorMsg = 'An error occured';
          switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
              errorMsg = 'This email already exists';
              break;
            case 'WEAK_PASSWORD':
              errorMsg = 'Password should be at least 6 characters';
              break;
            case 'EMAIL_NOT_FOUND':
              errorMsg = 'This email does not exists';
              break;
            case 'INVALID_PASSWORD':
              errorMsg = 'This password is invalid';
              break;
          }
          return throwError(() => errorMsg);
        })
      )
  }
}
