import { Component, OnInit, NgZone } from '@angular/core';
import { LoadingController, Platform } from 'ionic-angular';
import { AuthService as AppAuthService } from '../../services/auth.app';
import { AuthService as WebAuthService } from '../../services/auth.web';
import env from '../../config/env';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit {
  authData: any = { authenticated: false, profile: {} };
  initialized: boolean = false;
  me: any = {};

  constructor(
    private appAuthService: AppAuthService,
    private webAuthService: WebAuthService,
    private platform: Platform,
    private zone: NgZone,
    public loadingCtrl: LoadingController,
  ) {}

  async ngOnInit() {
    const loader = this.loadingCtrl.create({
      content: 'Please wait...',
      duration: 10000,
    });
    await loader.present();
    setTimeout(async () => {
      if (this.platform.is('ios') || this.platform.is('android')) {
        this.authData = await AppAuthService.init(this.onLoggedIn);
        loader.dismissAll();
        return (this.initialized = true);
      }
      this.authData = await WebAuthService.init();
      loader.dismissAll();
      return (this.initialized = true);
    }, 1000);
  }

  onLoggedIn = async () => {
    this.authData = await AppAuthService.init();
    this.zone.run(() => null);
  };

  async onGetUserProfileInApiServer() {
    const loader = this.loadingCtrl.create({
      content: 'Please wait...',
      duration: 10000,
    });
    await loader.present();
    try {
      const response = await fetch(`${env.serverApiUrl}api/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.authData.token}`,
        },
      });
      this.me = await response.json();
      loader.dismissAll();
    } catch (e) {
      console.log(e);
    }
  }

  protected onLogin = async () => {
    if (this.platform.is('ios') || this.platform.is('android')) return this.appAuthService.login();
    return this.webAuthService.login();
  };

  protected onRegister = () => {
    if (this.platform.is('ios') || this.platform.is('android')) return this.appAuthService.register();
    return this.webAuthService.register();
  };

  protected onLogout = async () => {
    if (this.platform.is('ios') || this.platform.is('android')) {
      this.authData = { authenticated: false, profile: {} };
      await AppAuthService.logout();
      return this.ngOnInit();
    } else {
      await WebAuthService.logout();
    }
  };
}
