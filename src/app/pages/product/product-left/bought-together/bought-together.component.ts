import { Component, OnInit, Input} from '@angular/core';
import { Path } from '../../../../config';
import { DinamicPrice } from '../../../../functions';

import { ProductsService } from '../../../../services/products.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-bought-together',
  templateUrl: './bought-together.component.html',
  styleUrls: ['./bought-together.component.css']
})
export class BoughtTogetherComponent implements OnInit {
  

  // Contiene datos que paso desde el producto del componente padre (product left)
  @Input() childItem: any;

  path:string = Path.url;
  products:any[] = [];
  price:any[] = [];
  render:boolean = true;


  constructor(
    private productsService: ProductsService
  ) { }

  ngOnInit(): void {

    // hago un filtro de todos los products que sean igual a title_list
    this.productsService.getFilterData("title_list", this.childItem["title_list"]).subscribe(resp => {

      this.productsFnc(resp);

    });

  }

    // Declaramos una función para mostrar los productos recomendados
    productsFnc(response) {


      let getProduct = [];
      // agregamos a products el producto que traimos del componente padre
      this.products.push(this.childItem);
  
      // Hacemos un recorrido por la response que nos traiga el filtrado y almacenamos en getProduct
      for(let i in response) {
  
        getProduct.push(response[i]);
  
      }

      // Ordenamos de mayor a menor las views de los products
      getProduct.sort(function(a, b) {

        return (b.views - a.views);
      
      });

      // Filtramos solo 1 producto de getProduct
      getProduct.forEach((product, index) => {

        if(index < 1) {
          // 'this.products' contiene el producto del componente padre y un producto con la mayor vista 'views'
          this.products.push(product);

        }

        
      });

      // Recorremos los dos productos de 'products'
      for(let i in this.products) {
        //Price
        this.price.push(DinamicPrice.fnc(this.products[i]));

      }

    }

    callback() {

      if(this.render) {

        this.render = false;

        // .end-price es el nombre d la clase q puse en la funcion en DinamicPrice en su <span class="end-price">${offer}</span>
        //.endPrice es el nombre q puse en el html de este bought-together en [innerHTML]="price[i][0], esto aumente porque con .end-price sumaba todos los precios(3 precios)
        //  para especificar que sume solo los dos precios de recomendaciones y no con el otro precio de arriba 
        let price = $(".endPrice .end-price");
        let total = 0;
        
        for(let i = 0; i < price.length; i++) {

          total = total + Number($(price[i]).html());

        }
        // se agrega en el html el precio total
        $(".ps-block__total strong").html(`$${ total.toFixed(2) }`);

      }

    }

}
