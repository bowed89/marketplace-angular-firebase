import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { ProductsService } from '../../../services/products.service';
import { ActivatedRoute } from '@angular/router';

import { Rating, DinamicRating, DinamicReviews, DinamicPrice, Pagination, Select2Cofig, Tabs } from '../../../functions';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-products-showcase',
  templateUrl: './products-showcase.component.html',
  styleUrls: ['./products-showcase.component.css'],
})
export class ProductsShowcaseComponent implements OnInit {

  path:string = Path.url;
  products:any[] = [];
  render:boolean = true;
  preload:boolean = false;
  rating:any[] = [];
  reviews:any[] = [];
  price:any[] = [];
  // paginacion
  param:string = null;
  page;
  productFound:number = 0;
  currentRoute:string = null;
  totalPage:number = 0;
  //sort, popularity, high, low.. orden
  sort;
  // Mostrar los nombres popularity, high, low.. en el cuadro de select cuando elegimos una de esas opciones
  sortItems:any[] = [];
  sortValues:any[] = [];


  constructor(
    private _productsService: ProductsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.preload = true;

    // [0] Capturamos la categoria y subcategoria
    // [1] Capturamos latest,popularity, low, high para ordenar
    // [2] Capturamos la página 1, 2, 3, etc ...
    this.param = this.activatedRoute.snapshot.params["param"].split("&")[0];
    this.sort = this.activatedRoute.snapshot.params["param"].split("&")[1];
    this.page = this.activatedRoute.snapshot.params["param"].split("&")[2];

    // Si en sort envia numero quiere decir que esta enviando paginacion a la orden sort. ej: clothing-apparel&2
    if(Number.isInteger(Number(this.sort))) {
     
      this.page = this.sort;
      this.sort = undefined;
      
    }

    // Evaluamos que el parámetro sort de orden no esté definido
    if(this.sort == undefined) {
      // http://localhost:4200/products/consumer-electric
      this.currentRoute = `products/${this.param}`;

    } else {
      // http://localhost:4200/products/consumer-electric&popularity
      this.currentRoute = `products/${this.param}&${this.sort}`;

    }

            
        //Filtramos los datos de categorias
        this._productsService.getFilterData("category", this.param).subscribe(resp1 => {


          // Si el objeto 'resp' no está vacio
          if(Object.keys(resp1).length > 0) {
    
              this.productsFnc(resp1);
          
          } else {
            // Si el objeto 'resp' esta vacio entonces llama al sgte. servicio 
            // Filtramos los datos de subcategorias
            this._productsService.getFilterData("sub_category", this.param).subscribe(resp2 => {

                this.productsFnc(resp2);
    
            });
    
          }
          
    
        });
  }

  
  // Declaramos una función para mostrar el catalogo de productos
  productsFnc(response) {

    this.products = [];
    let getProducts = [];
    let total = 0;

    // Hacemos un recorrido por la response que nos traiga el filtrado
    for(let i in response) {

      total ++;
      getProducts.push(response[i]);
    
    }

    // Definimops el total de productos y la paginacion de productos
    this.productFound = total;
    this.totalPage = Math.ceil(total / 6);

    /* SORT ORDENES FECHA, POPULARITY, PRICE  */
    // Ordenamos por fecha de lo actual a lo antiguo si envia solo paginacion en la url
    if(this.sort == undefined || this.sort == "first") {

      getProducts.sort(function(a, b) {

        return (b.date_created - a.date_created);

      });

      this.sortItems = [
        "Sort by first",
        "Sort by latest",
        "Sort by popularity",
        "Sort by price: low to high",
        "Sort by price: high to low"
      ];

      this.sortValues = [
        "first",
        "latest",
        "popularity",
        "low",
        "high"
      ];

    }

    // Ordenamos por fecha de lo antiguo a lo actual si envia sort en la url
     if(this.sort == "latest") {

       getProducts.sort(function(a, b) {
    
        return (a.date_created - b.date_created);
    
       });

       
      this.sortItems = [
        "Sort by latest",
        "Sort by first",
        "Sort by popularity",
        "Sort by price: low to high",
        "Sort by price: high to low"
      ];

      this.sortValues = [
        "latest",
        "first",
        "popularity",
        "low",
        "high"
      ];

    }

    // Ordenamos por views de mayor a menor si envia sort en la url
    if(this.sort == "popularity") {

      getProducts.sort(function(a, b) {
   
       return (b.views - a.views);
   
      });

      this.sortItems = [
        "Sort by popularity",
        "Sort by first",
        "Sort by latest",
        "Sort by price: low to high",
        "Sort by price: high to low"
      ];

      this.sortValues = [
        "popularity",
        "first",
        "latest",
        "low",
        "high"
      ];
   
    }   

    // Ordenamos por price de menor a mayor si envia sort en la url
    if(this.sort == "low") {

      getProducts.sort(function(a, b) {
        
       return (a.price - b.price);
       
      });

      this.sortItems = [
        "Sort by price: low to high",
        "Sort by first",
        "Sort by latest",
        "Sort by popularity",
        "Sort by price: high to low"
      ];

      this.sortValues = [
        "low",
        "first",
        "latest",
        "popularity",
        "high"
      ];
   
    }   

    // Ordenamos por price de mayor a menor si envia sort en la url
   if(this.sort == "high") {

      getProducts.sort(function(a, b) {
  
      return (b.price - a.price);
  
      });

      this.sortItems = [
        "Sort by price: high to low",
        "Sort by first",
        "Sort by latest",
        "Sort by popularity", 
        "Sort by price: low to high"
      ];

      this.sortValues = [
        "high",
        "first",
        "latest",
        "popularity",
        "low"
      ];
 
    }   
    /**** FIN DE SORT ORDENES FECHA, POPULARITY, PRICE  ****/

      // recorremos getProducts
      getProducts.forEach((product, index) => {

        //Evaluamos si viene numero de pagina definida
        if(this.page == undefined) {

          this.page = 1;

        }

        // Configuramos la paginacion 'desde - hasta'
        let first = Number(index) + (this.page * 6) - 6;
        let last = 6 * this.page;

        // Filtramos los productos a mostrar
        if(first < last) {

          if(getProducts[first] != undefined) {

            this.products.push(getProducts[first]);

            // almacenamos en 'rating' el promedio de calificaciones de las reseñas
            this.rating.push(DinamicRating.fnc(getProducts[first]));
  
            this.reviews.push(DinamicReviews.fnc(this.rating[index]));
            
            this.price.push(DinamicPrice.fnc(getProducts[first]));
  
            this.preload = false;

          }

        }

      });

    

  }

  callback(param) {

    if(this.render) {

      this.render = false;

      Rating.fnc();
      Pagination.fnc();
      Select2Cofig.fnc();
      Tabs.fnc();
      
      // Capturamos del DOM del sortItem
      $(".sortItem").change(function() {
        //Capturamos 'param' desde el DOM para usarlo en jQuery, nose puede capturar asi: 'this.param' desde acá
        // $(this).val(): es el <option value="latest">, <option value="popularity"> .. del DOM
        // '_top': evita que se abra una nueva ventana y se recarga de la pagina actual
        window.open(`products/${ param }&${ $(this).val() }`, '_top');
			

      });

    }

  }
}

/* PAGINATION */
/* 
Ej. de lo que se está haciendo *
PAGINA 1 FIRST: LAST 6
0 + (1 x 6) - 6 = 0
1 + (1 x 6) - 6 = 1
2 + (1 x 6) - 6 = 2
3 + (1 x 6) - 6 = 3
4 + (1 x 6) - 6 = 4
5 + (1 x 6) - 6 = 5

PAGINA 2 FIRST: LAST 12
0 + (2 x 6) - 6 = 6
1 + (2 x 6) - 6 = 7
2 + (2 x 6) - 6 = 8
3 + (2 x 6) - 6 = 9
4 + (2 x 6) - 6 = 10
5 + (2 x 6) - 6 = 11

PAGINA 3 FIRST: LAST 18
0 + (3 x 6) - 6 = 12
1 + (3 x 6) - 6 = 13
2 + (3 x 6) - 6 = 14
3 + (3 x 6) - 6 = 15
4 + (3 x 6) - 6 = 16
5 + (3 x 6) - 6 = 17



*/