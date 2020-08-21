import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-breadcrumbs',
  templateUrl: './search-breadcrumbs.component.html',
  styleUrls: ['./search-breadcrumbs.component.css']
})
export class SearchBreadcrumbsComponent implements OnInit {

  breadcrumb:string = null;

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {

    // Capturamos parametros de la URL y lo que venga con _ sera reemplazado con espacio
    this.breadcrumb = this.activatedRoute.snapshot.params["param"].replace(/[_]/g, " ");
  }

}
