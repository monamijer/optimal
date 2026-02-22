import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";

export interface Breadcrumb{
  label: string;
  url: string;
}

@Injectable({
  providedIn: "root",
})
export class BreadcrumbService{
  build(route: ActivatedRouteSnapshot, url: string = '', breadcrumbs: Breadcrumb[]=[]): Breadcrumb[]{

  const label = route.data?.['breadcrumb'];
  const path =  route.routeConfig?.path;

  if(path){
    url += `/${path}`
  }
  if(label){
    breadcrumbs.push({
      label,
      url
    });
  }
  if(route.firstChild){
    return this.build(route.firstChild, url, breadcrumbs);
  }
  return breadcrumbs;
}
}
