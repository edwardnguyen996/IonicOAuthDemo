import 'rxjs/add/operator/toPromise';
declare var Keycloak: any;
import { Injectable } from '@angular/core';
import env from '../config/env';

@Injectable()
export class AuthService {
  static keycloak: any;

  constructor() {}

  static async init(onAuthSuccess?: any) {
    return new Promise(resolve => {
      AuthService.keycloak = new Keycloak({
        url: env.authConfig.url,
        realm: env.authConfig.realm,
        clientId: env.authConfig.clientId,
        responseMode: env.authConfig.responseMode,
        credentials: {
          secret: env.authConfig.clientSecret,
        },
      });
      AuthService.keycloak.onAuthSuccess = function() {
        if (onAuthSuccess) {
          return AuthService.keycloak
            .loadUserProfile()
            .success(function(profile) {
              onAuthSuccess({ authenticated: true, token: AuthService.keycloak.token, profile });
            })
            .error(function(error) {
              onAuthSuccess({ authenticated: false, error, profile: {} });
            });
        }
      };
      AuthService.keycloak
        .init({ onLoad: 'check-sso' })
        .success(authenticated => {
          if (!authenticated) return resolve({ authenticated: false, profile: {} });
          return AuthService.keycloak
            .loadUserProfile()
            .success(function(profile) {
              resolve({ authenticated: true, token: AuthService.keycloak.token, profile });
            })
            .error(function(error) {
              resolve({ authenticated: false, error, profile: {} });
            });
        })
        .error(error => {
          console.log(error);
          resolve({ authenticated: false, error, profile: {} });
        });
    });
  }

  public async login(): Promise<any> {
    if (!AuthService.keycloak) {
      await AuthService.init();
    }
    return AuthService.keycloak.login();
  }

  public async register(): Promise<any> {
    if (!AuthService.keycloak) {
      await AuthService.init();
    }
    return AuthService.keycloak.login({
      action: 'register',
    });
  }

  static async logout(): Promise<any> {
    return AuthService.keycloak.logout();
  }
}
