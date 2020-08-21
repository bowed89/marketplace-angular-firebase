import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';
import { CategoriesService } from '../../services/categories.service';
import { SubCategoriesService } from '../../services/sub-categories.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  path:string = Path.url;
  categories:object = null;
  render:boolean = true;
  categoriesList:any[] = [];

  constructor(
    private _categoriesService: CategoriesService,
    private _subCategoriesService: SubCategoriesService
  ) {}

  ngOnInit(): void {
    this._categoriesService.getData().subscribe((resp) => {
      this.categories = resp;
      // Recorremos por el Objeto de la data de categories
      for (let i in resp) {
        // separamos los nombres de categorias
        this.categoriesList.push(resp[i].name);
      }
    });
  }

  // Funcion q avisa la finalizacion del renderizado de las categorias
  callback() {

    if (this.render) {
      this.render = false;
      let arraySubCategories = [];

      // Separamos las categorias
      this.categoriesList.forEach((category) => {
        // llamamos al servicio y filtramos con el titleList de las sub categorias
        this._subCategoriesService
          .getFilterData('category', category)
          .subscribe((resp) => {
            // Hacemos un recorrido por la coleccion gral de subcategorias y clasificamos las subcategorias y la url
            // de acuerdo a la categoria que corresponda
            for (let i in resp) {
              arraySubCategories.push({
                category: resp[i].category,
                subCategory: resp[i].name,
                url: resp[i].url,
              });
            }

            // Recorremos el arraySubCategories para buscar coincidencias con los nombres de categorias
            for (let f in arraySubCategories) {
              if (category == arraySubCategories[f].category) {
                $(`[category-footer='${category}']`).after(
                  `<a href="products/${arraySubCategories[f].url}">${arraySubCategories[f].subCategory}</a>`
                );
              }
            }
          });
      });
    }
    
  }
}
