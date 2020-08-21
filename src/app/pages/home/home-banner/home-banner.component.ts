import { Component, OnInit } from '@angular/core';

import { ProductsService } from '../../../services/products.service';
import { Path } from '../../../config';
import { OwlCarouselConfig, BackgroundImage } from '../../../functions';

@Component({
  selector: 'app-home-banner',
  templateUrl: './home-banner.component.html',
  styleUrls: ['./home-banner.component.css']
})
export class HomeBannerComponent implements OnInit {

  path:string =  Path.url;
  banner_home:any[] = [];
  category:any[] = [];
  url:any[] = [];
  render:boolean = true;
  preload:boolean = false;

  constructor(
    private _productsService: ProductsService
  ) { }

  ngOnInit(): void {

    this.preload = true;

    let index = 0;

    this._productsService.getData().subscribe(resp => {

      // Longitud del objeto
      let size = 0;

      for(let i in resp) {

        size ++;

      }

      // Generar un numero aleatorio
      // Si el objeto contiene mas de 5 productos genera aleatoriamente, pero si tiene menos 
      // a 5 productos solo muestran esos 5 productos
      if(size > 5) {
        // se resta 5 porque si la cantidad total en products es 47 y muestra el ramdon en 45
        // mostraria los 5 productos siguientes pero sino hay mas q mostrar se debe restar 5 
        index = Math.floor(Math.random() * (size - 5));

        // Llamamos del servicio los limits.
        // (Object.keys(resp)[index]): devuelve el indice aleatoriamente de cada objeto q llame.
        this._productsService.getLimitData(Object.keys(resp)[index], 5).subscribe(resp => {

          for(let i in resp) {

            this.banner_home.push(JSON.parse(resp[i].horizontal_slider));
            this.category.push(resp[i].category);
            this.url.push(resp[i].url);
            this.preload = false;


          }

        });
      }

    });

  }

  callback() {

    if(this.render) {

      this.render = false;
      
      OwlCarouselConfig.fnc();
      BackgroundImage.fnc();


    }

  }

}
