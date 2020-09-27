import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { ActivatedRoute } from '@angular/router';

import { ProductsService } from '../../../services/products.service';
import { UsersService } from '../../../services/users.service';

import { DinamicRating, DinamicReviews, DinamicPrice, Rating, OwlCarouselConfig, CarouselNavigation } from '../../../functions';

@Component({
  selector: 'app-related-product',
  templateUrl: './related-product.component.html',
  styleUrls: ['./related-product.component.css']
})
export class RelatedProductComponent implements OnInit {

  
  path:string = Path.url;
  products:any[] = [];
  rating:any[] = [];
  reviews:any[] = [];
  price:any[] = [];
  render:boolean = true;
  preload:boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _productsService: ProductsService,
    private _usersService: UsersService
    
    ) { }

  ngOnInit(): void {
    
    this.preload = true;

    let param = this.activatedRoute.snapshot.params["param"];

    this._productsService.getFilterData("url", param).subscribe(resp => {

      for(let i in resp) {

        // obtenemos la tienda del producto y filtramos en todos los products el store con el nombre de la tienda
        this._productsService.getFilterData("category", resp[i].category).subscribe(resp2 => {
         
          this.productsFnc(resp2);
          
        });
      }

    });

  }

  // Declaramos una función para mostrar los productos recomendados
  productsFnc(response) {
    
    let getProduct = [];
    this.products = [];

    // Hacemos un recorrido por la response que nos traiga el filtrado
    for(let i in response) {

      getProduct.push(response[i]);

    }

    //Ordenamos de mayor a menor las views en 'getProduct'
    getProduct.sort(function(a, b) {

      return (b.views - a.views);

    });

    getProduct.forEach((product, index) => {

      // Solo sacaremos los dos productos de mayor venta
      if(index < 10) {

        this.products.push(product);

        // almacenamos en 'rating' el promedio de calificaciones de las reseñas
        this.rating.push(DinamicRating.fnc(this.products[index]));

        this.reviews.push(DinamicReviews.fnc(this.rating[index]));

        this.price.push(DinamicPrice.fnc(this.products[index]));

        this.preload = false;

      }

    });

  
  }

  callback() {

    if(this.render) {

      this.render = false;

      // setTimeout es para que recarguen la funcion  Rating los ratings de estrellas
      setTimeout(function() {

        Rating.fnc();
        OwlCarouselConfig.fnc(); 
        CarouselNavigation.fnc();

      }, 1000);

    }

  }
      
  // Funcion para agregar productos a la lista de deseos
  // product: al hacer click en los corazones obtenemos la url de los productos
  addWishList(product) {
    
    this._usersService.addWishlist(product);

  }

}
