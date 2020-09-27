import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as firebase from "firebase/app";
import "firebase/auth";

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

  // Registro con FACEBOOK
  facebookRegister() {

    let localUsersService = this._usersService;
    let localUser = this.user;

    // https://firebase.google.com/docs/web/setup
    // Creamos una nueva APP WEB en Settings en Firebase
    // npm install --save firebase
    // Agrergamos: import * as firebase from "firebase/app";
    // import "firebase/auth";

    // Inicializamos Firebase en la app web:

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY",
      authDomain: "marketplace-9bcb8.firebaseapp.com",
      databaseURL: "https://marketplace-9bcb8.firebaseio.com",
      projectId: "marketplace-9bcb8",
      storageBucket: "marketplace-9bcb8.appspot.com",
      messagingSenderId: "216016160895",
      appId: "1:216016160895:web:fc57ca7862cb0f169e174a"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // https://firebase.google.com/docs/auth/web/facebook-login

    // Crear una instancia del objecto proveedor de facebook
    var provider = new firebase.auth.FacebookAuthProvider();

    // Accedemos con una ventana emergente y con certificado SSL (https)
    // https://fmoralesdev.com/2020/01/03/serve-angular-app-over-https-using-angular-cli/
    // ng serve --ssl true -o --sslKey ssl/server.key --sslCert ssl/server.crt

    // Accedemos a una ventana emergente
    firebase.auth().signInWithPopup(provider).then(function(result) {
      
      registerFirebaseDataBase(result, localUser, localUsersService);

     
    }).catch(function(error) {
      
      var errorMessage = error.message;

      SweetAlert.fnc("error", errorMessage, "register");
     
    });

    function registerFirebaseDataBase(result, localUser, localUsersService) {

      var user = result.user;

      // si existe valores en user.P y es true
      if(user.P) {

          localUser.displayName = user.displayName;
          localUser.email = user.email;
          localUser.idToken = user.b.b.g;
          localUser.method = "facebook";
          localUser.username = user.email.split('@')[0];
          localUser.picture = user.photoURL;

        // Evitar que se dupliquen los registros en la DB Firebase
        localUsersService.getFilterData("email", user.email).subscribe(resp => {

          if(Object.keys(resp).length > 0) {

            SweetAlert.fnc("error", `You're already signed in, please login with ${ resp[Object.keys(resp)[0]].method } method`, "login");

          } else {
            
            // Registramos los datos de usersModel en la DB
            localUsersService.registerDatabase(localUser).subscribe(resp => {

              if(resp["name"] != "") {

                SweetAlert.fnc("success", "Please login with Facebook", "login");

              }
      
              console.log('resp', resp)

            });

          }

        })
        
      }
     
    }


  }

  // Registro con GOOGLE
  googleRegister() {

    let localUsersService = this._usersService;
    let localUser = this.user;

    // https://firebase.google.com/docs/web/setup
    // Creamos una nueva APP WEB en Settings en Firebase
    // npm install --save firebase
    // Agrergamos: import * as firebase from "firebase/app";
    // import "firebase/auth";

    // Inicializamos Firebase en la app web:

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY",
      authDomain: "marketplace-9bcb8.firebaseapp.com",
      databaseURL: "https://marketplace-9bcb8.firebaseio.com",
      projectId: "marketplace-9bcb8",
      storageBucket: "marketplace-9bcb8.appspot.com",
      messagingSenderId: "216016160895",
      appId: "1:216016160895:web:fc57ca7862cb0f169e174a"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // https://firebase.google.com/docs/auth/web/google-signin

    // Crear una instancia del objecto proveedor de Google
    var provider = new firebase.auth.GoogleAuthProvider();
    
    // Accedemos a una ventana emergente
    firebase.auth().signInWithPopup(provider).then(function(result) {
      
      registerFirebaseDataBase(result, localUser, localUsersService);

     
    }).catch(function(error) {
      
      var errorMessage = error.message;

      SweetAlert.fnc("error", errorMessage, "register");
     
    });

    function registerFirebaseDataBase(result, localUser, localUsersService) {

      var user = result.user;

      // si existe valores en user.P y es true
      if(user.P) {

          localUser.displayName = user.displayName;
          localUser.email = user.email;
          localUser.idToken = user.b.b.g;
          localUser.method = "google";
          localUser.username = user.email.split('@')[0];
          localUser.picture = user.photoURL;

        // Evitar que se dupliquen los registros en la DB Firebase
        localUsersService.getFilterData("email", user.email).subscribe(resp => {

          if(Object.keys(resp).length > 0) {

            SweetAlert.fnc("error", `You're already signed in, please login with ${ resp[Object.keys(resp)[0]].method } method`, "login");

          } else {
            
            // Registramos los datos de usersModel en la DB
            localUsersService.registerDatabase(localUser).subscribe(resp => {

              if(resp["name"] != "") {

                SweetAlert.fnc("success", "Please login with Google+", "login");

              }
      
              console.log('resp', resp)

            });

          }

        })
        
      }
     
    }
  
  }

}
