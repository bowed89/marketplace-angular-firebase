import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-header-promotions',
  templateUrl: './header-promotions.component.html',
  styleUrls: ['./header-promotions.component.css']
})
export class HeaderPromotionsComponent implements OnInit {

  path:string = Path.url;
  top_banner:object = null;
  category:object = null;
  url:object = null;
  preload:boolean = false;


  constructor(
    private _productService: ProductsService
  ) { }

  ngOnInit(): void {

    this.preload = true;

    this._productService.getData().subscribe(resp => {

        // TOMAR EL TAMAÑO DEL OBJETO
        let size = 0;

        for(let i in resp) {
          
          size ++;

        }

        // GENERAR UN NUMERO ALEATORIO CON EL TAMAÑO  ENTRE EL 0 Y EL 46 POR EL 'SIZE'
        let index = Math.floor(Math.random() * size);
        

        // DEVOLVER A LA PAGINA DE INICIO UN BANNER ALEATORIO CON EL 'INDEX' Q GENERA UN NUMERO RANDOM
        this.top_banner = JSON.parse(resp[Object.keys(resp)[index]].top_banner);
        this.category = resp[Object.keys(resp)[index]].category;
        this.url = resp[Object.keys(resp)[index]].url;

        this.preload = false;
 

    });

  }

}
