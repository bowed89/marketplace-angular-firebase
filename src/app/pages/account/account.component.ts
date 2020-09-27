import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  constructor(
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {

    // retorna 'resp' true si el token del locastorage coincide con las autenticaciones registradas en firebase,
    // retorna 'resp' false el token del locastorage no coincide con las autenticaciones registradas en firebase. then porque es Promise en authActivate()
    this._usersService.authActivate().then(resp => {

      if(!resp) {

        window.open("login", "_top");

      }

    });


  }

}
