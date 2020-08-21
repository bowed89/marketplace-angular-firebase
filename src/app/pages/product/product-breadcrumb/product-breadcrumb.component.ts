import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-product-breadcrumb',
  templateUrl: './product-breadcrumb.component.html',
  styleUrls: ['./product-breadcrumb.component.css']
})
export class ProductBreadcrumbComponent implements OnInit {

  breadcrumb:string = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _productsService: ProductsService
  ) { }

  ngOnInit(): void {

    // Capturamos parametros de la URL y lo que venga con - sera reemplazado con espacio
    this.breadcrumb = this.activatedRoute.snapshot.params["param"].replace(/[-]/g, " ");
    
    let param = this.activatedRoute.snapshot.params["param"];

    // Actualiza 'views' vistas del producto
    this._productsService.getFilterData("url", param).subscribe(resp => {

      for(let i in resp) {

        let id = Object.keys(resp).toString();

        let value = {

          "views":Number(resp[i].views + 1)
        
        };
        
        this._productsService.patchData(id, value).subscribe(resp => {});

      }


    });

  }

}
