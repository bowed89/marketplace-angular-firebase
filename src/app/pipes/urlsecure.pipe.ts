import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'urlsecure'
})
export class UrlsecurePipe implements PipeTransform {

  /* *** PIPE PARA PERMITIR USOS DE URL'S SEGURAS EN EL DOM *** */

  constructor(
    private domSanitizer: DomSanitizer
  ){}

  transform(value:string, ...args: unknown[]): SafeResourceUrl {

    return this.domSanitizer.bypassSecurityTrustResourceUrl(value);

  }

}
