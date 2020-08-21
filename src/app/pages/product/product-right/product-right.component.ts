import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { DinamicRating, DinamicReviews, DinamicPrice, Rating } from '../../../functions';


@Component({
  selector: 'app-product-right',
  templateUrl: './product-right.component.html',
  styleUrls: ['./product-right.component.css']
})
export class ProductRightComponent implements OnInit {

  path:string = Path.url;
  products:any[] = [];
  rating:any[] = [];
  reviews:any[] = [];
  price:any[] = [];
  render:boolean = true;
  preload:boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _productsService: ProductsService
  ) { }

  ngOnInit(): void {

    this.preload = true;

    let param = this.activatedRoute.snapshot.params["param"];

    this._productsService.getFilterData("url", param).subscribe(resp => {

      for(let i in resp) {

        // obtenemos la tienda del producto y filtramos en todos los products el store con el nombre de la tienda
        this._productsService.getFilterData("store", resp[i].store).subscribe(resp2 => {
         
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

    //Ordenamos de mayor a menor las ventas en 'getProduct'
    getProduct.sort(function(a, b) {

      return (b.sales - a.sales);

    });

    getProduct.forEach((product, index) => {

      // Solo sacaremos los dos productos de mayor venta
      if(index < 4) {

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
      Rating.fnc();

    }

  }

}
