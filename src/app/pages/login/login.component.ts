import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { SweetAlert } from '../../functions';

import { UsersModel } from '../../models/users.model';
import { UsersService } from '../../services/users.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user: UsersModel;

  constructor(
    private _usersService: UsersService,
    private activatedRoute: ActivatedRoute
  ) {

    this.user = new UsersModel();

  }

  ngOnInit(): void {

    // Validacion de formulario de Bootstrap 4
    (function() {

        'use strict';
        window.addEventListener('load', function() {
          // Get the forms we want to add validation styles to
          var forms = document.getElementsByClassName('needs-validation');
          // Loop over them and prevent submission
          var validation = Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
              if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
              }
              form.classList.add('was-validated');
            }, false);
          });
        }, false);
      })();

      // Verificar la URL que envia al login desde el correo que nos pasa mediante firebase. Ej::::
      // localhost:4200/login?mode=verifyEmail&oobCode=ghSUTaQ-lNwHo8D20aYdKuV033HYya_OkL5K1ERLFUsAAAF0BA5aAA&apiKey=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY&lang=en
      // necesitamos de esa url el 'oobCode' y 'mode'
      if(this.activatedRoute.snapshot.queryParams["oobCode"] != undefined && this.activatedRoute.snapshot.queryParams["mode"] == "verifyEmail") {

        let body = {

          oobCode: this.activatedRoute.snapshot.queryParams["oobCode"]

        }

        this._usersService.confirmEmailVerificationFnc(body).subscribe(resp => {

          console.log(resp)

          if(resp["emailVerified"]) {

            // Filtramos con el email de resp y actualizamos el campo needConfirm del doc 'users' de la DB
            this._usersService.getFilterData("email", resp["email"]).subscribe(resp2 => {

              for(let i in resp2) {

                let id = Object.keys(resp2).toString();

                let value = {

                  needConfirm: true

                };

                this._usersService.patchData(id, value).subscribe(resp3 => {

                  if(resp3["needConfirm"]) {

                    SweetAlert.fnc("success", "¡Email confirm, login now!", "login");

                  }

                });

              }

            }); 

          }

        }, err => {
          // Error que la url del email ya fue confirmada
          if(err.error.error.message == 'INVALID_OOB_CODE') {
            
            SweetAlert.fnc("error", "The email has already been confirmed", "login");

          }

        });

      }

    }

    //Envio de formulario
    onSubmit(f: NgForm) { 
      
      // Si el formulario es invalido no almacena nada
      if(f.invalid) {

        return;

      }

      //Alerta suave mientras se registra el usuario, carga un snipper
      SweetAlert.fnc("loading", "Loading ...", null)

      //Validar que el correo este verificado cuando se envia una confirmacion al email la url que dirige al login ...
      this._usersService.getFilterData("email", this.user.email).subscribe(resp1 => {

        for(let i in resp1) {

          // Si es true el needConfirm entonces se confirmo el correo desde la url y hago el login
          if(resp1[i].needConfirm) {

            // Registro en Firebase Authentication, firebase requiere que returnSecureToken sea true
            this.user.returnSecureToken = true;

            this._usersService.loginAuth(this.user).subscribe(resp2 => {

              // Almacenar idToken
              let id = Object.keys(resp1).toString();

              let value = {

                idToken: resp2["idToken"]

              };
              // Actualizando el idToken del usuario que esta siendo logueado, porque el idtoken expira hora y se debe actualizar despues q pase la hora...
              this._usersService.patchData(id, value).subscribe(resp3 => {

                if(resp3["idToken"] != "") {

                  //Alerta para cerrar el snipper
                  SweetAlert.fnc("close", null, null)

                  // Almacenamos el token en el localStorage
                  localStorage.setItem("idToken", (resp3["idToken"]));
                  
                  // Almacenamos el email en el localStorage
                  localStorage.setItem("email", (resp2["email"]));

                  // Almacenamos la fecha de expiracion en el localStorage
                  let today = new Date();

                  today.setSeconds(resp2["expiresIn"]);
                  
                  localStorage.setItem("expiresIn", today.getTime().toString());

                }

              });

   
            }, err => {

              SweetAlert.fnc("error", err.error.error.message, null)
        
            });
            
            
          } else {

            SweetAlert.fnc("error", "Need confirm your email", null)

          }

        }

      });



    }


    

}
