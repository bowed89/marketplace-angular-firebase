import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsersService } from '../services/users.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(
    private _usersService: UsersService,
    private router: Router
  ){}

  canActivate(): Promise<boolean> {

    return new Promise(resolve => {

      this._usersService.authActivate().then(resp => {

        if(!resp) {

          this.router.navigateByUrl("/login");

          resolve(false);

        } else {

          resolve(true);

        }

      });

    });

  }
  
}
