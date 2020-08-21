import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';

import { ProductsService } from '../../../services/products.service';
import { SalesService } from '../../../services/sales.service';

import { OwlCarouselConfig, CarouselNavigation, ProductLightbox, SlickConfig, CountDown, Rating, ProgressBar } from '../../../functions';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-home-hot-today',
  templateUrl: './home-hot-today.component.html',
  styleUrls: ['./home-hot-today.component.css'],
})
export class HomeHotTodayComponent implements OnInit {

  path:string = Path.url;
  indexes:any[] = [];
  render:boolean = true;
  renderBestSeller:boolean = true;
  products:any[] = [];
  preload:boolean = false;
  topSales:any[] = [];
  topSalesBlock:any[] = [];

  constructor(
    private _productsService: ProductsService,
    private _salesService: SalesService
    ) {}

  ngOnInit(): void {

    this.preload = true;

    let getProducts = [];
    let hoy = new Date();
    let fechaOferta = null;

    // Obtenemos los products
    this._productsService.getData().subscribe((resp) => {
      // Recorremos cada producto para separar offer y stock
      for (let i in resp) {

        getProducts.push({
          "offer": JSON.parse(resp[i].offer),
          "stock": resp[i].stock,
        });

        this.products.push(resp[i]);

      }

      // Recorremos 'getProducts' para clasificar las ofertas actuales y los productos q si tengan stock
      for (let j in getProducts) {
        // Convertimos la fecha del 'offer' en formato JS
        // getProducts[j].offer[2]: obtiene la fecha del offer q esta en la posicion 2 del array
        // .split("-")[0]: halla la primera posicion de la fecha '2020-06-30' del signo ' - ', obtiene el año en la pos. 0 

        fechaOferta = new Date(

          parseInt(getProducts[j].offer[2].split("-")[0]),
          parseInt(getProducts[j].offer[2].split("-")[1])-1,
          parseInt(getProducts[j].offer[2].split("-")[2])
        
          );

          if(hoy < fechaOferta && getProducts[j].stock > 0) {

            this.indexes.push(j);
            this.preload = false;

          }
        }
    });

    //************* Tomamos los datos de SALES 'ventas' PARA LOS 20 PRODUCTOS MÁS VENDIDOS *************
    this._salesService.getData().subscribe(resp => {

      let getSales = [];
      // Recorremos cada Venta para separar los productos y las cantidades y guardar en 'getSales'
      for(let i in resp) {

        getSales.push({
          "product": resp[i].product,
          "quantity": resp[i].quantity
        });
      }

      // Ordenamos de mayor a menor quantity de 'getSales'
      getSales.sort(function(a, b) {
        return (b.quantity - a.quantity);
      });
      
      // Sacamos del objeto 'getSales' los productos que estan repetidos para dejar solo prod. de mayor quantity
      let filterSales = [];

      getSales.forEach( sale => {

        if(!filterSales.find(resp => resp.product == sale.product)) {
 
          const {product, quantity} = sale;

          filterSales.push({product, quantity});

        } 

      });
      
      // filtramos los datos de los 'products' buscando coincidencias con las ventas 'filterSales'
      // para obtener todos los datos de los productos de 'filterSales'

      let block = 0;

      filterSales.forEach((sale, index) => {
        
        

        // Filtramos hasta 20 productos
        if(index < 20) {

          block ++;
          
          this._productsService.getFilterData("name", sale.product).subscribe(resp => {

            for(let i in resp) {

              this.topSales.push(resp[i]);

            }
          });
        }
  
      });

      // Enviamos el maximo de bloques para mostrar 4 productos por bloque
      for(let i = 0; i < Math.round(block/4); i++) {
      // en el ej. sacara 4 bloques en 'Top 20 Best Seller'
        this.topSalesBlock.push(i);
      }


    });

  }
  // Funcion que nos avisa cuando finaliza el renderizado 

  callbackBestSeller(topSales) {

    if(this.renderBestSeller) {

      this.renderBestSeller = false;

      // Capturamos la cantidad de bloques que existe en el DOM
      let topSaleBlock = $(".topSaleBlock");

      let top20Array = [];

      // Ejecutamos en setTimeOut - por cada bloque un segundo de espera: 'topSaleBlock.length * 1000'
      setTimeout(function() {

        // Removemos el preload
        $(".preload").remove();
        
        // hacemos un ciclo por la cantidad de bloques
        for(let i = 0; i < topSaleBlock.length; i++) {

          // Agrupamos la cantidad de 4 productos por bloque
          top20Array.push(
            //topSales.slice: esta agrupando los productos del objeto 'topSales' de la sgte forma: (0,4) (4,8) (8,12) (12,16)
            topSales.slice(i * topSaleBlock.length, (i * topSaleBlock.length) + topSaleBlock.length)

          );

          // Hacemos un recorrido por el nuevo array 'top20Array' de objetos
          for(let f in top20Array[i]) {

            // Definimos si el precio del producto tiene oferta o no
            let price;
            let type;
            let value;
            let offer;
            let offerDate;
            let today = new Date();

            if(top20Array[i][f].offer != "") {

              offerDate = new Date(

                parseInt(JSON.parse(top20Array[i][f].offer)[2].split("-")[0]),
                JSON.parse(top20Array[i][f].offer)[2].split("-")[1] - 1,
                parseInt(JSON.parse(top20Array[i][f].offer)[2].split("-")[2]),
            
              );

              if(today < offerDate) {

                type = JSON.parse(top20Array[i][f].offer)[0];
                value = JSON.parse(top20Array[i][f].offer)[1];

                if(type == "Disccount") {

                  offer = (top20Array[i][f].price - (top20Array[i][f].price * value / 100)).toFixed(2)

                }

                if(type == "Fixed") {

                  offer = value;

                }

                 price = `<p class="ps-product__price sale">$${offer} <del>$${top20Array[i][f].price}</del> </p>`

              } else {

                price = `<p class="ps-product__price">$${top20Array[i][f].price}</p>`

              }

            } else {

              price = `<p class="ps-product__price">$${top20Array[i][f].price}</p>`

            }
            // adicinamos a la vista los productos clasificados

            $(topSaleBlock[i]).append(`

                <div class="ps-product--horizontal">

                  <div class="ps-product__thumbnail">
                      <a href="product/${ top20Array[i][f].url }">
                          <img src="assets/img/products/${ top20Array[i][f].category }/${ top20Array[i][f].image }">
                      </a>
                  </div>

                  <div class="ps-product__content">

                      <a class="ps-product__title" href="product/${ top20Array[i][f].url }">${ top20Array[i][f].name }</a>

                     ${price}

                </div>

            </div>
        `);
            
          }


        }

        // Modificamos es estilo del plugin Owl Carousel
        $(".owl-dots").css({"bottom": "0"});
        $(".owl-dot").css({"background": "#ddd"});

      }, topSaleBlock.length * 1000);

    }

  }

  // Funcion que nos avisa cuando finaliza el renderizado 
  callback() {

    if(this.render) {

      this.render = false;

      // Seleccionamos del DOM los elementos galleryMix_1, galleryMix_2, galleryMix_3
      let galleryMix_1 = $(".galleryMix_1");
      let galleryMix_2 = $(".galleryMix_2");
      let galleryMix_3 = $(".galleryMix_3");

      // Seleccionamos del DOM los elementos de la oferta offer_1, offer_2, offer_3
      let offer_1 = $(".offer_1");
      let offer_2 = $(".offer_2");
      let offer_3 = $(".offer_3");

      // Seleccionamos del DOM los elementos de la reseña review_1, review_2, review_3
      let review_1 = $(".review_1");
      let review_2 = $(".review_2");
      let review_3 = $(".review_3");

      // galleryMix_1 contiene todas las galerias de cada producto con ofertas
      // Recorremos galleryMix_1, galleryMix_1.length es el tamaño de los productos en ofertas, en mi caso son 10 productos. 
      for(let i = 0; i < galleryMix_1.length; i++) {

                              /*****  SECCION DE GALLERYMIX_1,2,3  *****/ 

        // Recorremos las galerias de img que contiene cada galleryMix_1 ["1.jpg", "2.jpg", "3.jpg"],
        // donde se encuentra dentro del DOM en [attr.gallery]="products[i].gallery"
 
        for(let f = 0; f < JSON.parse($(galleryMix_1[i]).attr("gallery")).length; f++) {

          //Agregamos las img grandes dentro del div galleryMix_2 en el DOM
          //${JSON.parse($(galleryMix_1[i]).attr("gallery"))[f]} contiene los nombres de las imgs "1.jpg", "2.jpg", "3.jpg"
          // ${$(galleryMix_1[i]).attr("category")} contiene los nombres d las categorias
          $(galleryMix_2[i]).append(
            `<div class="item">
              <a href="assets/img/products/${$(galleryMix_1[i]).attr("category")}/gallery/${JSON.parse($(galleryMix_1[i]).attr("gallery"))[f]}">
                <img src="assets/img/products/${$(galleryMix_1[i]).attr("category")}/gallery/${JSON.parse($(galleryMix_1[i]).attr("gallery"))[f]}">
              </a>
            </div>
            `
          );
          //Agregamos las img pequeñas dentro del div galleryMix_3 en el DOM
          $(galleryMix_3[i]).append(
            `<div class="item">
               <img src="assets/img/products/${$(galleryMix_1[i]).attr("category")}/gallery/${JSON.parse($(galleryMix_1[i]).attr("gallery"))[f]}">
             </div>
             `
          );
        }
                                /*****  SECCION DE OFFER_1,2,3  *****/ 

        // Capturamos el array de ofertas 'offer' de cada producto 
        // Se captura del DOM [attr.offer]="products[i].offer", ["Disccount","25", "2020-06-30"]
        let offer = JSON.parse($(offer_1[i]).attr("offer"));

        // Capturamos el array de precio 'price' de cada producto
        let price = Number($(offer_1[i]).attr("price"));

        // Dentro del array 'offer' ["Disccount","25", "2020-06-30"], preguntamos si es Disccount en el indice 0 
        if(offer[0] == "Disccount") {
          // En el DOM se muestra el porcentaje que se descuenta del total del precio
          $(offer_1[i]).html(
            `<span>Save <br> $${ ((price * offer[1] / 100)).toFixed(2) }</span>`
          );         
           // En el DOM se muestra la resta del precio total menos el porcentaje que se descuenta(regla de 3 para sacar el descuento), donde se ubica en la posicon 1 del 'offer'
          $(offer_2[i]).html( `$${(price - (price * offer[1] / 100)).toFixed(2) }` );

        }
        // Dentro del array 'offer' ["Fixed","25", "2020-06-30"], preguntamos si es precio fijo 'Fixed' en el indice 0 
        if(offer[0] == "Fixed") {

          // En el DOM se muestra la resta del precio total menos la cantidad de descuento, donde se ubica en la posicon 1 del 'offer'
          $(offer_1[i]).html(
            `<span>Save <br> $${ offer[1] }</span>`
          );
          // En el DOM se muestra la cantidad de rebaja
          $(offer_2[i]).html( `$${(price - offer[1]).toFixed(2)}` );

        }

        // Agregamos la fecha de 'Expires In'
        // Capturamos dentro del array 'offer' ["Fixed","25", "2020-06-30"] la fecha
        $(offer_3[i]).attr("data-time",
          new Date(

            parseInt(offer[2].split("-")[0]),
            parseInt(offer[2].split("-")[1])-1,
            parseInt(offer[2].split("-")[2])
        
          )
        
        );

                    /*****  SECCION DE REVIEW_1,2,3  *****/ 

        // Calculamos el total de las calificaciones de las reseñas
        let totalReview = 0;
        // JSON.parse($(review_1[i]).attr("reviews")).length: es la longitud de reviews que tiene cada objeto
        for(let f = 0; f < JSON.parse($(review_1[i]).attr("reviews")).length; f++) {
          //Esa sacando la sumatoria del campo 'review' del objeto reviews de products
          totalReview = totalReview + Number(JSON.parse($(review_1[i]).attr("reviews"))[f]["review"]);

        }

        // Sacamos el promedio de la calificacion, dividiendo la sumatoria de totalReview entre la longitud de reviews que tiene cada objeto
        let rating = Math.round(totalReview / JSON.parse($(review_1[i]).attr("reviews")).length);

        $(review_3[i]).html(rating);

        // en <option value="2"> cuando es 2 nose pinta las estrellas, pero si es <option value="1"> se pintan las estrellas
        for(let g = 1; g <= 5; g++) {

          $(review_2[i]).append(
            `<option value="2">${g}</option>`
            );

            if(rating == g) {

              $(review_2[i]).children('option').val(1);
            
            }
        }
        
      }
      // Se activan los plugins necesarios para que funcione el home hot today
      OwlCarouselConfig.fnc();
      CarouselNavigation.fnc();
      ProductLightbox.fnc();
      SlickConfig.fnc();
      // Ejecutamos el plugin para q funcione el 'expires In'
      CountDown.fnc();
      // Ejecutamos el plugin para q funcione las reseñas 'rating'
      Rating.fnc();
      // Ejecutamos el plugin para q funcione la barra del stock
      ProgressBar.fnc();

    }
  }
}
