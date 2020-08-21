import { Component, OnInit } from '@angular/core';

import { Path } from '../../../config';
import { CategoriesService } from '../../../services/categories.service';

@Component({
  selector: 'app-home-top-categories',
  templateUrl: './home-top-categories.component.html',
  styleUrls: ['./home-top-categories.component.css']
})
export class HomeTopCategoriesComponent implements OnInit {

  path:string = Path.url;
  categories:any[] = [];
  preload:boolean = false;

  constructor(
    private _categoriesService: CategoriesService
  ) { }

  ngOnInit(): void {

    this.preload = true;

    //Tomamos los datos de Categories
    let getCategories = []
    
    this._categoriesService.getData().subscribe(resp => {

      for(let i in resp) {

        getCategories.push(resp[i]);

      }

      // ordenamos las vistas 'views' de mayor a menor de getCategories
      getCategories.sort(function(a, b) {
        return (b.view - a.view);
      });

      // Filtramos hasta 6 categorias
       getCategories.forEach((category, index) => {

        if(index < 6) {

          this.categories[index] = getCategories[index];
          this.preload = false;

        }
      });
    });

  }

}
