import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Path, Server } from '../../../config';
import { Tooltip } from '../../../functions';

import { UsersService } from '../../../services/users.service';

import { SweetAlert } from '../../../functions';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css']
})
export class AccountProfileComponent implements OnInit {

  path:string = Path.url;
  id:string;
  vendor:boolean = false;
  displayName:string;
  username:string;
  email:string;
  picture:string;
  preload:boolean = false;
  method:boolean = false;
  server:string = Server.url;
  image:File = null;

  // variables para usar el ngModel en los modales
  pass: any;


  constructor(
    private _usersService: UsersService,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    this.preload = true;
    
    // Validar si existe usuario autenticado
    this._usersService.authActivate().then(resp => {
  
      if(resp){
        
        this._usersService.getFilterData("idToken", localStorage.getItem("idToken")).subscribe(resp => {
                  
        // Almacenar idToken
        this.id = Object.keys(resp).toString();

          for(let i in resp){

            // Preguntamos si es vendedor o no
            if(resp[i].vendor){

              this.vendor = true;

            }

            // Asignamos datos del usuario autenticado
            this.displayName = resp[i].displayName;
            this.username = resp[i].username;
            this.email = resp[i].email;

            //Asignamos fotos del usuario autenticado
            if(resp[i].picture != undefined){

              // Si el usuario esta registrado por Facebook o Google
              if(resp[i].method != "direct"){

                this.picture = resp[i].picture;

              } else{

                this.picture = `assets/img/users/${resp[i].username}/${resp[i].picture}`;

              }

            } else{

              this.picture = `assets/img/users/default/default.png`;

            }

            // Metodo de registro: si es facebook o google
            if(resp[i].method != "direct"){

              this.method = true;

            }

            this.preload = false;

          }

        });

      } 

    });

    // FUNCION PARA EJECUTAR EL TOOLTIP DE BOOTSTRAP 4
    Tooltip.fnc();

    // SCRIPT PARA SUBIR IMG CON EL INPUT DE BOOTSTRAP

    // Add the following code if you want the name of the file appear on select
    $(".custom-file-input").on("change", function() {
      var fileName = $(this).val().split("\\").pop();
      $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });

    //  VALIDAR FORMULARIO DE BOOTSTRAP 4
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
  

  // Enviar nueva contraseña
  newPassword(value) {

    console.log('value', value)
    
    if(value != "") {

      SweetAlert.fnc("loading", "Loading ...", null);

      let body = {

        idToken: localStorage.getItem('idToken'),
        password: value,
        returnSecureToken: true
        
      };

      this._usersService.changePasswordFnc(body).subscribe(resp1 => {

        let value = {

          idToken: resp1["idToken"]

        };
        // Actualizando el idToken del usuario que esta cambiando su contraseña
        this._usersService.patchData(this.id, value).subscribe(resp2 => {

        
          // Almacenamos el nuevo token en el localStorage
          localStorage.setItem("idToken", (resp1["idToken"]));
            
          // Almacenamos la fecha de expiracion en el localStorage
          let today = new Date();

          today.setSeconds(resp1["expiresIn"]);
          
          localStorage.setItem("expiresIn", today.getTime().toString());

          SweetAlert.fnc("success", "The password changed successfully", "account");
        
        })

      }, err => {

        SweetAlert.fnc("error", err.error.error.message, null);

      });

    }
    
  }

  // VALIDAR IMAGEN
  validateImage(e){

    this.image = e.target.files[0];

    // Validar formato
    if(this.image["type"] !== "image/jpeg" && this.image["type"] !== "image/png"){

      SweetAlert.fnc("error","The image must be in JPG or PNG format", null);

    }

    // Validamos el tamaño
    else if(this.image["size"] > 2000000){

      SweetAlert.fnc("error", "The image must not weigh more than 2MB", null);
      return;

    }

    // mostramos la img temporal
    else{

      let data = new FileReader();
      data.readAsDataURL(this.image);

      $(data).on("load", function(event){

        let path = event.target.result;

        $(".changePicture").attr("src", path);

      });

    }
    

  }

  //SUBIR IMG AL SERVIDOR
  uploadImage(){

    const formData = new FormData();

    formData.append('file', this.image);
    formData.append('folder', this.username);
    formData.append('path', 'users');
    formData.append('width', '200');
    formData.append('height', '200');

    // la resp será la respuesta del archivo index.php 
    this.http.post(this.server, formData).subscribe(resp => {

      console.log(resp)

      if(resp["status"] = 200) {

        let body = {
          //nombre del archivo que se creó randomicamente del php
          picture: resp["result"]

        };

        this._usersService.patchData(this.id, body).subscribe(resp => {

          if(resp["picture"] != "") {

            SweetAlert.fnc("success", "¡ Your photo has been updated !", "account");

          }

        });

        

      }

    });



  }

}
