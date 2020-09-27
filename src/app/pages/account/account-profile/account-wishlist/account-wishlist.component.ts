import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { Path } from '../../../../config';
import { DinamicPrice } from '../../../../functions';
import { SweetAlert } from '../../../../functions';

import notie from 'notie';
import { confirm } from 'notie';

import { UsersService } from '../../../../services/users.service';
import { ProductsService } from '../../../../services/products.service';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-account-wishlist',
  templateUrl: './account-wishlist.component.html',
  styleUrls: ['./account-wishlist.component.css']
})
export class AccountWishlistComponent implements OnInit, OnDestroy {

  @Input() childItem:any;

  path:string = Path.url;
  wishlist:any[] = [];
  products:any[] = [];
  price:any[] = [];
  stock:any[] = [];
  render:boolean = true;

  popoverMessage:string = 'Are you sure to remove it?';

  dtOptions: DataTables.Settings = {};
  // con el trigger almacenamos los datos de los productos y lo llevamos al datatable
  dtTrigger: Subject<any> = new Subject();
  

  constructor(
    private _usersService: UsersService, 
    private _productsService: ProductsService
  ) { }

  ngOnInit(): void {

    //Agregamos Opciones a Datatables
    this.dtOptions = {

      pagingType: 'full_numbers',
      processing: true

    };

    // Resp nos devolverá todos los datos del usuario logueado con su id, que viene del documento 'users' de la DB
    this._usersService.getUniqueData(this.childItem).subscribe(resp => {

      if(resp["wishlist"] != undefined) {
        
        // Tomamos de resp su lista de deseos
        this.wishlist = JSON.parse(resp["wishlist"]);

        let load = 0;
        
        // Recorremos el this.wishlist
        if(this.wishlist.length > 0) {

          this.wishlist.forEach(list => {

            // filtramos con los ids de wishlist los productos
            this._productsService.getFilterData("url", list).subscribe(resp => {

              // Recorremos los datos de resp
              for(let i in resp) {

                load++;

                // Agregamos los productos
                this.products.push(resp[i]);
                
                // Validamos los precios en oferta
                this.price.push(DinamicPrice.fnc(resp[i]));
  
  
                // Validamos productos en stock
                if(resp[i]["stock"] == 0) {
  
                  this.stock.push(`<span class="ps-tag ps-tag--out-stock">Out-stock</span>`);
  
                }else {
  
                  this.stock.push(`<span class="ps-tag ps-tag--in-stock">In-stock</span>`);
  
                }
  
                //Preguntamos cuando termine de cargar todos los datos en el DOM(datos de los wishlist del usuario)
                if(load == this.wishlist.length){
                  //Trigger se disparara cuando acabe de cargar los datos
                  this.dtTrigger.next();
  
                }
                
              }

            });

          });

        }

      }

    });
  }

  // Eliminamos el producto de wishlist
  removeProduct(product) {

  /*=============================================
    Buscamos coincidencia para remover el producto
    =============================================*/

    this.wishlist.forEach((list, index)=>{
      
      if(list == product){

        this.wishlist.splice(index, 1);

      }

    })

    /*=============================================
    Actualizamos en Firebase la lista de deseos
    =============================================*/

    let body ={

      wishlist: JSON.stringify(this.wishlist)
    
    };

    this._usersService.patchData(this.childItem, body).subscribe(resp=>{

        if(resp["wishlist"] != ""){

          SweetAlert.fnc("success", "Product removed", "account");

        }

    });

  }

  callback() {

    if(this.render) {
      
      this.render = false;

        // Punto de quiebre: es para cuando la ventana esté tipo responsivo desde 991px pueda realizar la operacionde de eliminar producto
        if(window.matchMedia("(max-width:991px)").matches) {
          
          let localWishlist = this.wishlist;
          let localUserService = this._usersService;
          let localChildItem = this.childItem; 

          $(document).on("click", ".removeProduct", function(){

            let product = $(this).attr("remove");

            // POPUP DE CONFIRMAR SI ESTAMOS SEGUROS DE ELIMINAR CON NOTIE
            notie.confirm({

              text: 'Are you sure to remove it?',

              cancelCallback: function(){

                return;

              },

              submitCallback: function(){

                // Buscamos coincidencias para eliminar el producto
                localWishlist.forEach((list, index) => {
      
                  if(list == product) {
      
                    localWishlist.splice(index, 1);
      
                  }
                
                });
      
                // Actualizamos en Firebase el wishlist con el producto eliminado del array wishlist
                let body = {
      
                  wishlist: JSON.stringify(localWishlist)
      
                };
      
                localUserService.patchData(localChildItem, body).subscribe(resp => {
      
                  if(resp["wishlist"] != "") {
      
                    SweetAlert.fnc("success", "Product removed", "account");
      
                  }
                  
                });
              
              }

            });
                    
          }); 
      }

    }

  }

  // Destruimos el Trigger
  ngOnDestroy():void{

    this.dtTrigger.unsubscribe();
  
  }
  

}
