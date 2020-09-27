import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';

import { OwlCarouselConfig, CarouselNavigation, Rating, DinamicRating, DinamicReviews, DinamicPrice } from '../../../functions';

import { ProductsService } from '../../../services/products.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-products-recommended',
  templateUrl: './products-recommended.component.html',
  styleUrls: ['./products-recommended.component.css']
})
export class ProductsRecommendedComponent implements OnInit {


  path:string = Path.url;
  recommendedItems:any[] = [];
  render:boolean = true;
  rating:any[] = [];
  reviews:any[] = [];
  price:any[] = [];
  preload:boolean = false;

  constructor(
    private _productsService: ProductsService,
    private activatedRoute: ActivatedRoute,
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {

    this.preload = true;

    //Capturamos elparametro url
    let param = this.activatedRoute.snapshot.params['param'].split("&")[0];

        //Filtramos los datos de categorias
        this._productsService.getFilterData("category", param).subscribe(resp1 => {

          // Si el objeto 'resp' no está vacio
          if(Object.keys(resp1).length > 0) {

              this.productsFnc(resp1);
    
          } else {
            // Si el objeto 'resp' esta vacio entonces llama al sgte. servicio 
            // Filtramos los datos de subcategorias
            this._productsService.getFilterData("sub_category", param).subscribe(resp2 => {

                this.productsFnc(resp2);
                
            });
    
          }
          
    
        });

  }

  // Declaramos una función para mostrar los productos recomendados
  productsFnc(response) {

    let getSales = [];
    this.recommendedItems = [];

    // Hacemos un recorrido por la response que nos traiga el filtrado
    for(let i in response) {

      getSales.push(response[i]);

    }
      

      // Ordenar de mayor a menor las vsitas views de 'getSales' 
      getSales.sort(function(ab, b) {

        return(b.views - ab.views);
      
      });
      
      // filtramos solo hasta 10 products
      getSales.forEach((product, index) => {

        if(index < 10) {

          this.recommendedItems.push(product);

          // almacenamos en 'rating' el promedio de calificaciones de las reseñas
          this.rating.push(DinamicRating.fnc(this.recommendedItems[index]));

          this.reviews.push(DinamicReviews.fnc(this.rating[index]));

          this.price.push(DinamicPrice.fnc(this.recommendedItems[index]));

          this.preload = false;

        }

      });

   

  }

  callback() {

    if(this.render) {

      this.render = false;

      OwlCarouselConfig.fnc();
      CarouselNavigation.fnc();
      Rating.fnc();

    }


  }

  // Funcion para agregar productos a la lista de deseos
  // product: al hacer click en los corazones obtenemos la url de los productos
  addWishList(product) {
    
    this._usersService.addWishlist(product);

  }



}
