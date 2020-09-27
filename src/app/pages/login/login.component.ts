import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as firebase from "firebase/app";
import "firebase/auth";

import { SweetAlert } from '../../functions';

import { UsersModel } from '../../models/users.model';
import { UsersService } from '../../services/users.service';
import { ActivatedRoute } from '@angular/router';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user: UsersModel;
  rememberMe: boolean = false;
  // variables para usar el ngModel en los modales
  pass: any;
  mail: any;

  constructor(
    private _usersService: UsersService,
    private activatedRoute: ActivatedRoute
  ) {

    this.user = new UsersModel();

  }


  ngOnInit(): void {

    // Validar accion de recordar correo
    if(localStorage.getItem("rememberMe") && localStorage.getItem("rememberMe") == "yes") {

      this.user.email = localStorage.getItem("email");
      this.rememberMe = true;

    }


      /*=============================================
      Validar formulario de Bootstrap 4
      =============================================*/

      // Disable form submissions if there are invalid fields
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
      if(this.activatedRoute.snapshot.queryParams["oobCode"] != undefined &&
      this.activatedRoute.snapshot.queryParams["mode"] == "verifyEmail") {

        let body = {

          oobCode: this.activatedRoute.snapshot.queryParams["oobCode"]

        }

        this._usersService.confirmEmailVerificationFnc(body).subscribe(resp => {

          console.log(resp)

          if(resp["emailVerified"]) {

            // Filtramos con el email de resp y actualizamos el campo needConfirm del doc 'users' de la DB
            this._usersService.getFilterData("email", resp["email"]).subscribe(resp => {

              for(let i in resp) {

                let id = Object.keys(resp).toString();

                let value = {

                  needConfirm: true

                };

                this._usersService.patchData(id, value).subscribe(resp => {

                  if(resp["needConfirm"]) {

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

      // Confirmar cambio de contraseña
      // cuando reseteamos la contraseña firebase nos envia una url similar: 
      // http://localhost:4200/login?mode=resetPassword&oobCode=L1f-rkbSSTT8EHMG_5FaRzVzSGaHCrnaKAcVhHsjR8AAAAF0I9oXzA&apiKey=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY&lang=en
      if(this.activatedRoute.snapshot.queryParams["oobCode"] != undefined &&
         this.activatedRoute.snapshot.queryParams["mode"] == "resetPassword") {

        let body = {

          oobCode: this.activatedRoute.snapshot.queryParams["oobCode"]

        }

        this._usersService.verifyPasswordResetCodelFnc(body).subscribe(resp => {
          // Si la resp nos trae requestType == "PASSWORD_RESET"
          if(resp["requestType"] == "PASSWORD_RESET") {

            // Abrimos el modal newPassword del html
            $("#newPassword").modal();

          }

        });
        
      }

    }

      
    //Validacion de expresion regular del formulario
    validate(input){

      let pattern;

      if($(input).attr("name") == "password" || $(input).attr("name") == "pass"){

        pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/;
        
      }

      if(!pattern.test(input.value)){

        $(input).parent().addClass('was-validated')

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

                  // Almacenamos email en el LocalStorage cuando esta tickeado
                  if(this.rememberMe) {

                    localStorage.setItem("rememberMe", "yes");

                  }else {

                    localStorage.setItem("rememberMe", "no");

                  }

                  // Redirecciona al usuario a la pagina de su cuenta
                  window.open("account", "_top");

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

    // Enviar solicitud para recuperar contraseña
    resetPassword(value: string) {

      SweetAlert.fnc("loading", "Loading ...", null);

      let body = {

    		requestType: "PASSWORD_RESET",
    		email: value

      };

      this._usersService.SendPasswordResetEmailFnc(body).subscribe(resp => {

        if(resp["email"] == value) {

          SweetAlert.fnc("success", "Check your email to change the password", "login");

        }

      });

    }

    // Enviar nueva contraseña
    newPassword(value) {

      console.log('value', value)
      
      if(value != "") {

        SweetAlert.fnc("loading", "Loading ...", null);

        let body = {

	    		oobCode: this.activatedRoute.snapshot.queryParams["oobCode"],
          newPassword: value
          
        };
  
        this._usersService.confirmPasswordResetFnc(body).subscribe(resp => {
  
	    		if(resp["requestType"] == "PASSWORD_RESET"){

	    			SweetAlert.fnc("success", "Password change successful, login now", "login")

	    		}
  
        });

      }
    }
    
    // Login con FACEBOOK
    facebookLogin() {

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
        
        loginFirebaseDataBase(result, localUser, localUsersService);

      
      }).catch(function(error) {
        
        var errorMessage = error.message;

        SweetAlert.fnc("error", errorMessage, "login");
      
      });

      function loginFirebaseDataBase(result, localUser, localUsersService) {

        var user = result.user;

        // si existe valores en user.P y es true
        if(user.P) {

          localUsersService.getFilterData("email", user.email).subscribe(resp => {

            if(Object.keys(resp).length > 0) {

              // Preguntamos si se esta logueando por el metodo de Facebook
              if(resp[Object.keys(resp)[0]].method == "facebook") {
                
                // Actualizamos el idtoken en Firebase
                let id = Object.keys(resp).toString();

                let body = {

                  idToken: user.b.b.g 

                };

                localUsersService.patchData(id, body).subscribe(resp => {
                  
                  //Alerta para cerrar el snipper
                  SweetAlert.fnc("close", null, null)

                  // Almacenamos el token en el localStorage
                  localStorage.setItem("idToken", user.b.b.g );
                  
                  // Almacenamos el email en el localStorage
                  localStorage.setItem("email", user.email);

                  // Almacenamos la fecha de expiracion en el localStorage
                  let today = new Date();

                  today.setSeconds(3600);
                  
                  localStorage.setItem("expiresIn", today.getTime().toString());

                  // Redirecciona al usuario a la pagina de su cuenta
                  window.open("account", "_top");

                });

              }else {

                SweetAlert.fnc("error", `You're already signed in, please login with ${ resp[Object.keys(resp)[0]].method } method`, "login");

              }



            } else {

              SweetAlert.fnc("error", "This account is not registered", "register");

            }

          });
          
        }
      
      }


    }

    // Login con GOOGLE
    googleLogin() {

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

      // Crear una instancia del objecto proveedor de Google
      var provider = new firebase.auth.GoogleAuthProvider();

      // Accedemos a una ventana emergente
      firebase.auth().signInWithPopup(provider).then(function(result) {
        
        loginFirebaseDataBase(result, localUser, localUsersService);

      
      }).catch(function(error) {
        
        var errorMessage = error.message;

        SweetAlert.fnc("error", errorMessage, "login");
      
      });

      function loginFirebaseDataBase(result, localUser, localUsersService) {

        var user = result.user;

        // si existe valores en user.P y es true
        if(user.P) {

          localUsersService.getFilterData("email", user.email).subscribe(resp => {

            if(Object.keys(resp).length > 0) {

              // Preguntamos si se esta logueando por el metodo de Google
              if(resp[Object.keys(resp)[0]].method == "google") {
                
                // Actualizamos el idtoken en Firebase
                let id = Object.keys(resp).toString();

                let body = {

                  idToken: user.b.b.g 

                };

                localUsersService.patchData(id, body).subscribe(resp => {
                  
                  //Alerta para cerrar el snipper
                  SweetAlert.fnc("close", null, null)

                  // Almacenamos el token en el localStorage
                  localStorage.setItem("idToken", user.b.b.g );
                  
                  // Almacenamos el email en el localStorage
                  localStorage.setItem("email", user.email);

                  // Almacenamos la fecha de expiracion en el localStorage
                  let today = new Date();

                  today.setSeconds(3600);
                  
                  localStorage.setItem("expiresIn", today.getTime().toString());

                  // Redirecciona al usuario a la pagina de su cuenta
                  window.open("account", "_top");

                });

              }else {

                SweetAlert.fnc("error", `You're already signed in, please login with ${ resp[Object.keys(resp)[0]].method } method`, "login");

              }



            } else {

              SweetAlert.fnc("error", "This account is not registered", "register");

            }

          });
          
        }
      
      }


    }

}
