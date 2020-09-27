import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';
import { CategoriesService } from '../../services/categories.service';
import { SubCategoriesService } from '../../services/sub-categories.service';
import { Search } from '../../functions';
import { UsersService } from '../../services/users.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.css']
})
export class HeaderMobileComponent implements OnInit {
  
  path:string = Path.url;
  categories:object = null;
  render:boolean = true;
  categoriesList:any[] = [];
  picture:string;
  authValidate:boolean = false;

  constructor(
    private _categoriesService: CategoriesService,
    private _subCategoriesService: SubCategoriesService,
    private _usersService: UsersService
    ) { }

  ngOnInit(): void {
    
    // Validar si existe usuario autenticado
    this._usersService.authActivate().then(resp => {

      if(resp){

        this.authValidate = true;

        this._usersService.getFilterData("idToken", localStorage.getItem("idToken")).subscribe(resp => {

          for(let i in resp){

            if(resp[i].picture != undefined){

              // Si el usuario esta registrado por Facebook o Google
              if(resp[i].method != "direct"){

                this.picture = `<img src="${resp[i].picture}" class="img-fluid rounded-circle w-50 ml-auto">`;

              } else{

                this.picture = `<img src="assets/img/users/${resp[i].username}/${resp[i].picture}" class="img-fluid rounded-circle ml-auto">`;

              }

            } else{

              this.picture = `<i class="icon-user"></i>`;

            }

          }

        });

      } 
    });


    this._categoriesService.getData().subscribe(resp => {

      this.categories = resp;

      // Recorremos por el Objeto de la data de categories
      for(let i in resp) {

        // separamos los nombres de categorias
        this.categoriesList.push(resp[i].name);

      }


      // Activamos el efecto Toggle en el listado de subcategorias
      $(document).on("click", ".sub-toggle", function(){

        $(this).parent().children('ul').toggle();

      });
    });
  }

  // Funcion q avisa la finalizacion del renderizado de las categorias
  callback() {

    if(this.render) {

      this.render = false;
      let arraySubCategories = [];

      // Separamos las categorias
      this.categoriesList.forEach(category => {
        
        // llamamos al servicio y filtramos con el titleList de las sub categorias
        this._subCategoriesService.getFilterData("category", category).subscribe(resp => {

          // Hacemos un recorrido por la coleccion gral de subcategorias y clasificamos las subcategorias y la url
          // de acuerdo a la categoria que corresponda
          for(let i in resp) {

            arraySubCategories.push({

              "category": resp[i].category,
              "subCategory": resp[i].name,
              "url": resp[i].url

            });

          }

          
          // Recorremos el arraySubCategories para buscar coincidencias con los nombres de categorias
          for(let f in arraySubCategories) {

            if(category == arraySubCategories[f].category) {

              $(`[category='${category}']`).append(

                `<li class=""current-menu-item>
                    <a href="products/${arraySubCategories[f].url}">${arraySubCategories[f].subCategory}</a>
                </li>`

              )



            }

          }





        });


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
