import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Capitalize, SweetAlert } from '../../functions';

import { UsersModel } from '../../models/users.model';
import { UsersService } from '../../services/users.service';

declare var jQuery: any;
declare var $: any;


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user: UsersModel;

  constructor(
    private _usersService: UsersService
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

  }

  // Capitalizar
  capitalize(input) {

    input.value = Capitalize.fnc(input.value);

  }

  //Validacion de expresion regular del formulario
  validate(input){ 

    let pattern;

    if($(input).attr("name") == "username") {

      pattern = /^[A-Za-z]{2,8}$/;

      input.value = input.value.toLowerCase();

      this._usersService.getFilterData('username', input.value).subscribe(resp => {

        if(Object.keys(resp).length > 0) {

          $(input).parent().addClass('was-validated');

          input.value = "";

          SweetAlert.fnc("error", "Username already exists", "login")

          return
          
        }

      })



    }

    if($(input).attr("name") == "password") {

      pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/;

    }

    if(!pattern.test(input.value)) {

      $(input).parent().addClass('was-validated');

      input.value = "";

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

    // Registro en Firebase Authentication. Firebase pide que returnSecureToken sea true
    this.user.returnSecureToken = true;

    this._usersService.registerAuth(this.user).subscribe(resp => {

      if(resp["email"] == this.user.email) {

        // Enviar correo de verificacion. Firebase requiere requestType y idToken para que haga la verificacion
        let body = {

          requestType: "VERIFY_EMAIL",
          idToken: resp["idToken"]

        }
        
        this._usersService.sendEmailVerificationFnc(body).subscribe(resp => {

          // si la resp email es igual al user.email al usuario que se almaceno en la BD
          if(resp["email"] == this.user.email) {

            this.user.displayName = `${this.user.first_name} ${this.user.last_name}`;
            this.user.method = "direct";
            this.user.needConfirm = false;
  
            // Registro en Firebase Database
            this._usersService.registerDatabase(this.user).subscribe(resp => {
  
              SweetAlert.fnc("success", "Confirm your account in your email (check spam)", "login")
  
            });

          }

        })
  
      }

    }, err => {
      // Mensaje de error desde firebase si es que ya existe un correo registrado en el Authentication
      SweetAlert.fnc("error", err.error.error.message, null)

    })

  }

}
