import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-home-promotions',
  templateUrl: './home-promotions.component.html',
  styleUrls: ['./home-promotions.component.css']
})
export class HomePromotionsComponent implements OnInit {

  path:string =  Path.url;
  banner_default:any[] = [];
  category:any[] = [];
  url:any[] = [];
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
      // Si el objeto contiene mas de 2 productos genera aleatoriamente, pero si tiene menos 
      // a 2 productos solo muestran esos 2 productos
      if(size > 2) {
        // se resta 2 porque si la cantidad total en products es 47 y muestra el ramdon en 46
        // mostraria los 2 productos siguientes pero sino hay mas q mostrar se debe restar 2 
        index = Math.floor(Math.random() * (size - 2));

        // Llamamos del servicio los limits.
        // (Object.keys(resp)[index]): devuelve el indice aleatoriamente de cada objeto q llame.
        this._productsService.getLimitData(Object.keys(resp)[index], 2).subscribe(resp => {

          for(let i in resp) {

            this.banner_default.push(resp[i].default_banner); 
            this.category.push(resp[i].category);
            this.url.push(resp[i].url);

            this.preload = false;

          }

        });
      }

    });

  }

}
