import { Component, OnInit } from '@angular/core';

import { Path } from '../../../config';

import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { UsersService } from '../../../services/users.service';

import { DinamicRating, DinamicReviews, DinamicPrice, Rating, CountDown, ProgressBar, Tabs, SlickConfig, ProductLightbox, Quantity } from '../../../functions';

@Component({
  selector: 'app-product-left',
  templateUrl: './product-left.component.html',
  styleUrls: ['./product-left.component.css']
})
export class ProductLeftComponent implements OnInit {

  path:string = Path.url;
  product:any[] = [];
  rating:any[] = [];
  reviews:any[] = [];
  price:any[] = [];
  preload:boolean = false;
  render:boolean = true;
  renderGallery:boolean = true;
  countd:any[] = [];
  gallery:any[] = [];
  tags:string = null;
  video:string = null;
  totalReviews:string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _productsService: ProductsService,
    private _usersService: UsersService

  ) { }

  ngOnInit(): void {

    this.preload = true;

    let param = this.activatedRoute.snapshot.params["param"];

    this._productsService.getFilterData("url", param).subscribe(resp => {

      this.productsFnc(resp);

    });
  }

  
  // Declaramos una función para mostrar los productos recomendados
  productsFnc(response) {

    let getProduct = [];
    this.product = [];

    // Hacemos un recorrido por la response que nos traiga el filtrado
    for(let i in response) {

      getProduct.push(response[i]);

    }
      
    getProduct.forEach((product, index) => {
        
        this.product.push(product);

        // almacenamos en 'rating' el promedio de calificaciones de las reseñas
        this.rating.push(DinamicRating.fnc(this.product[index]));

        this.reviews.push(DinamicReviews.fnc(this.rating[index]));

        this.price.push(DinamicPrice.fnc(this.product[index]));

        // Agregamos la fecha al contador
        if(this.product[index].offer != "") {

          const date = JSON.parse(this.product[index].offer)[2];

          // Obtenemos la fecha en formato JS
          this.countd.push(
            new Date(
              parseInt(date.split("-")[0]),
              parseInt(date.split("-")[1])-1,
              parseInt(date.split("-")[2])
            )
          );

        }
        // Gallery
        this.gallery.push(JSON.parse(this.product[index].gallery));

        // Video
        if(JSON.parse(this.product[index].video)[0] == 'youtube') {

          this.video = `https://www.youtube.com/embed/${JSON.parse(this.product[index].video)[1]}?rel=0&autoplay=0`;

        }

        if(JSON.parse(this.product[index].video)[0] == 'vimeo') {

          this.video = `https://player.vimeo.com/video/${JSON.parse(this.product[index].video)[1]}`;

        }

        // Agregamos los tags que almacenara: "sofa,furniture,home" y se tiene q pasar a un array asi: ["sofa","furniture","home"]
        this.tags = this.product[index].tags.split(",");

        // total Reviews
        this.totalReviews = JSON.parse(this.product[index].reviews).length;

        this.preload = false;

      });
    
    }

    callback() {

      if(this.render) {

        this.render = false;

        Rating.fnc();
        CountDown.fnc();
        ProgressBar.fnc();
        Tabs.fnc();
        Quantity.fnc();

      }


    }

    callbackGallery() {

      if(this.renderGallery) {

        this.renderGallery = false;

        SlickConfig.fnc();
        ProductLightbox.fnc();

      }
    }

    // Funcion para agregar productos a la lista de deseos
    // product: al hacer click en los corazones obtenemos la url de los productos
    addWishList(product) {

      this._usersService.addWishlist(product);

    }
}
