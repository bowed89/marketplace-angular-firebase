import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';
import { CategoriesService } from '../../services/categories.service';
import { SubCategoriesService } from '../../services/sub-categories.service';
import { Search } from '../../functions';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  path:string = Path.url;
  categories:object = null;
  arrayTitleList:any[] = [];
  render:boolean = true;


  constructor(
    private _categoriesService: CategoriesService,
    private _subCategoriesService: SubCategoriesService
  ) { }

  ngOnInit(): void {

    this._categoriesService.getData().subscribe(resp => {

      this.categories = resp;
      
      // Se tiene q recorrer el objeto para obtener el title_list
      for(let i in resp) {
        // Separamos en arrays resp[i].title_list, se convierte en json la cadena de texto y se guarda en arrayTitleList
        this.arrayTitleList.push(JSON.parse(resp[i].title_list));

      }


    });

  }

  // Funcion q avisa la finalizacion del renderizado de las categorias
  callback() {

    if(this.render) {

      this.render = false;
      let arraySubCategories = [];

      // Recorremos el arrayTitleList 
      this.arrayTitleList.forEach(titleList => {

        for(let i = 0; i < titleList.length; i++) {

          // llamamos al servicio y filtramos con el titleList de las sub categorias
          this._subCategoriesService.getFilterData("title_list", titleList[i]).subscribe( resp => {

            arraySubCategories.push(resp);

            let f;
            let g;
            let arrayTitleName = [];

            // Hacemos un recorrido general de las sub categorias
            for(f in arraySubCategories) {
              
              // Hacemos un recorrido particular de las sub categorias
              for(g in arraySubCategories[f]) {
                // Creamos un nuevo array de objetos clasificando cada subcategoria con la respectiva title_list a la q pertenece
                arrayTitleName.push(
                  {
                    "titleList": arraySubCategories[f][g].title_list,
                    "subCategory": arraySubCategories[f][g].name,
                    "url": arraySubCategories[f][g].url
                  }
                )
              }

            }

            // Recorremos el array de objetos arrayTitleName para buscar coincidencias con las listas de titulo
            for(f in arrayTitleName) {


              if(titleList[i] == arrayTitleName[f].titleList) {

                // Imprimir el nombre de la sub categoria debajo del listado correspondiente
                $(`[titleList='${titleList[i]}']`).append(
                  `<li>
                       <a href="products/${arrayTitleName[f].url}"> ${arrayTitleName[f].subCategory}</a>
                   </li>`)


              }

            }


          });

        }

      });

    }

  }

  // Funcion del buscador
  goSearch(search:string) {

    if(search.length == 0 || Search.fnc(search) == undefined) {

      return;

    } 

    window.open(`search/${ Search.fnc(search) }`, '_top');

  }
  

}
