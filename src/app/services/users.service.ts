import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SweetAlert } from '../functions';
import { Api, Register, Login, SendEmailVerification, ConfirmEmailVerification, GetUserData, SendPasswordResetEmail, VerifyPasswordResetCode, ConfirmPasswordReset, ChangePassword } from '../config';
import { UsersModel } from '../models/users.model';

declare var jQuery: any;
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private api:string = Api.url;
  private register:string = Register.url;
  private login:string = Login.url;
  private sendEmailVerification:string = SendEmailVerification.url;
  private confirmEmailVerification:string = ConfirmEmailVerification.url;
  private getUserData:string = GetUserData.url;
  private sendPasswordResetEmail:string = SendPasswordResetEmail.url;
  private verifyPasswordResetCode:string = VerifyPasswordResetCode.url;
  private confirmPasswordReset:string = ConfirmPasswordReset.url;
  private changePassword:string = ChangePassword.url;

  constructor(
    private http: HttpClient
  ) { }

  /* Registro en Firebase Authentication */

  registerAuth(user: UsersModel) {

    return this.http.post(`${this.register}`, user);

  }

  /* Login en Firebase Authentication */

  loginAuth(user: UsersModel) {

    return this.http.post(`${this.login}`, user);

  }

  /* Registro en Firebase Database */

  registerDatabase(user: UsersModel) {

    delete user.first_name;
    delete user.last_name;
    delete user.password;
    delete user.returnSecureToken;

    return this.http.post(`${this.api}/users.json`, user);

  }

  getFilterData(orderBy:string, equalTo:string) {

    return this.http.get(`${this.api}users.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`);

  }

  /* Enviar verificacion de correo electrónico */

  sendEmailVerificationFnc(body:object) {

    return this.http.post(`${this.sendEmailVerification}`, body);

  }

  /* Confirmar el Email de verificacion */

  confirmEmailVerificationFnc(body:object) {

    return this.http.post(`${this.confirmEmailVerification}`, body);
 
  }

  /* Actualizar datos de usuario */

  patchData(id:string, value:object) {

    return this.http.patch(`${this.api}users/${id}.json`, value);

  }

  /* Validar idToken de autenticacion */

  authActivate() {
   
    // Usamos Promise porque tiene q ser asíncrona la respuesta 

    return new Promise(resolve => {

      // Validamos que el idToken exista
      if(localStorage.getItem("idToken")) {

        let body = {

          idToken: localStorage.getItem("idToken")

        };

        this.http.post(`${this.getUserData}`, body).subscribe(resp => {

          // Validamos fecha de expiración
          if(localStorage.getItem("expiresIn")) {

            let expiresIn = Number(localStorage.getItem("expiresIn"));

            let expiresDate = new Date();
            expiresDate.setTime(expiresIn);

            if(expiresDate > new Date()) {

              resolve(true);

            }else {

              localStorage.removeItem('idToken');
              localStorage.removeItem('expiresIn');

              resolve(false);

            }

          }else {

            localStorage.removeItem('idToken');
            localStorage.removeItem('expiresIn');

            resolve(false);

          }

          resolve(true);
        
        }, err => {

          localStorage.removeItem('idToken');
          localStorage.removeItem('expiresIn');

          resolve(false);
        
        });
      
      } else {

        localStorage.removeItem('idToken');
        localStorage.removeItem('expiresIn');

        resolve(false);

      }

    });

  }

  // 1) Resetear la contraseña
  SendPasswordResetEmailFnc(body:object) {

    return this.http.post(`${this.sendPasswordResetEmail}`, body);

  }

  // 2) Confirmar el cambio de la contraseña
  verifyPasswordResetCodelFnc(body:object) {

    return this.http.post(`${this.verifyPasswordResetCode}`, body);

  }

  // 3) Enviar la nueva contraseña
  confirmPasswordResetFnc(body:object) {

    return this.http.post(`${this.confirmPasswordReset}`, body);

  }

  // Cambiar la contraseña
  changePasswordFnc(body:object) {

    return this.http.post(`${this.changePassword}`, body);

  }

  // Tomar informacion de un solo usuario
  getUniqueData(id:string) {

    return this.http.get(`${this.api}users/${id}.json`);

  }

  // Funcion para agregar productos a wishlist
  addWishlist(product:string) {
    
     // Validamos que el usuario esté autenticado
     this.authActivate().then(resp => {

      if(!resp) {

        SweetAlert.fnc("error", "The user must be logged in", null);

        return;

      }else {

        // Traemos todos los datos del usuario logueado por el idtoken para obtener su 'wishlist'
        this.getFilterData("idToken", localStorage.getItem("idToken")).subscribe(resp => {

          // Capturamos el id del usuario
          let id = Object.keys(resp).toString();

          for(let i in resp) {

            // Preguntamos si existe wishlist
            if(resp[i].wishlist != undefined) {

              let wishlist = JSON.parse(resp[i].wishlist);
              let length = 0;

              // Preguntamos si existe un producto en la wishlist
              if(wishlist.length > 0) {

                wishlist.forEach((list, index) => {

                  // Preguntamos sino se agrego este producto anteriormente a la wishlist
                  if(list == product) {

                    length --;

                  } else {

                    length ++;

                  }

                });
                // Si length es distinto a wishlist.length quiere decir que existe un producto repetido que se quiere agregar a wishlist
                if(length != wishlist.length) {

                  SweetAlert.fnc("error", "The product already exists on your wishlist", null);

                }else {

                  // Sino existe un producto repetido entonces agregamos el nuevo product al wishlist
                  wishlist.push(product);

                  let body = {

                    wishlist: JSON.stringify(wishlist)

                  };

                  this.patchData(id, body).subscribe(resp => {

                    if(resp["wishlist"] != "") {

                      // Sirve para que cuando agreguemos un producto a wishlist actualice la cantidad en el corazon del header 
                      // .totalWishlist esta en el header html
                      let totalWishlist = Number($(".totalWishlist").html());

                      $(".totalWishlist").html(totalWishlist +1);

                      SweetAlert.fnc("success", "Product added to wishlist", null);

                    }

                  });

                }

              }else {

                // Sino existe un producto repetido entonces agregamos el nuevo product al wishlist
                wishlist.push(product);

                let body = {

                  wishlist: JSON.stringify(wishlist)

                };

                this.patchData(id, body).subscribe(resp => {

                  if(resp["wishlist"] != "") {

                    // Sirve para que cuando agreguemos un producto a wishlist actualice la cantidad en el corazon del header 
                    // .totalWishlist esta en el header html
                    let totalWishlist = Number($(".totalWishlist").html());

                    $(".totalWishlist").html(totalWishlist +1);

                    SweetAlert.fnc("success", "Product added to wishlist", null);

                  }

                });

              }

            }else {

              // Cuando no exista una wishlist inicialmente creamos el campo  para el usuario 
              let body = {

                wishlist: `["${product}"]`

              };

              this.patchData(id, body).subscribe(resp => {

                if(resp["wishlist"] != "") {

                  // Sirve para que cuando agreguemos un producto a wishlist actualice la cantidad en el corazon del header 
                  // .totalWishlist esta en el header html
                  let totalWishlist = Number($(".totalWishlist").html());

                  $(".totalWishlist").html(totalWishlist +1);

                  SweetAlert.fnc("success", "Product added to wishlist", null);

                }

              });

            }


          }

        });

      }

    });  
  }

}
