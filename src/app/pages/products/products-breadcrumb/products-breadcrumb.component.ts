import { Component, OnInit } from '@angular/core';

import { CategoriesService } from '../../../services/categories.service';
import { SubCategoriesService } from 'src/app/services/sub-categories.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-products-breadcrumb',
  templateUrl: './products-breadcrumb.component.html',
  styleUrls: ['./products-breadcrumb.component.css']
})
export class ProductsBreadcrumbComponent implements OnInit {

  breadcrumb:string = null;

  constructor(
    private _categoriesService: CategoriesService,
    private _subCategoriesService: SubCategoriesService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    /* del app.routing.module : { path:'products/:param', component: ProductsComponent }, toma el nombre 'param' */
    let param = this.activatedRoute.snapshot.params['param'].split("&")[0];
    
    //Filtramos los datos de categorias
    this._categoriesService.getFilterData("url", param).subscribe(resp1 => {

      // Si el objeto 'resp' no está vacio
      if(Object.keys(resp1).length > 0) {

        for(let i in resp1) {

          this.breadcrumb = resp1[i].name;
          //Obtenemos el id de la categoria 
          let id = Object.keys(resp1).toString();
          console.log(id)
          // Creamos un objeto donde en el campo 'view' se sumará + 1
          let value = {
            "view":Number(resp1[i].view + 1)
          }
          // Servicio para incrementar las view
          this._categoriesService.patchData(id, value).subscribe(resp => {});


        }

      } else {
        // Si el objeto 'resp' esta vacio entonces llama al sgte. servicio 
        // Filtramos los datos de subcategorias
        this._subCategoriesService.getFilterData("url", param).subscribe(resp2 => {

          for(let i in resp2) {

            this.breadcrumb = resp2[i].name;

           //Obtenemos el id de la categoria 
           let id = Object.keys(resp2).toString();
           // Creamos un objeto donde en el campo 'view' se sumará + 1
           let value = {
             "view":Number(resp2[i].view + 1)
           }
          // Servicio para incrementar las view
           this._subCategoriesService.patchData(id, value).subscribe(resp => {});
    
          }

        });

      }
      

    });



  }

}
