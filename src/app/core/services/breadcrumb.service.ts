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
    const resolvedPath = path.split('/').map(segment => {
      if(segment.startsWith(':')){
        const paramName = segment.slice(1);
        return route.params[paramName] ?? segment;
      }
      return segment;
    }).join('/');
    url += `/${resolvedPath}`
  }
  if(label){
    const resolvedLabel = path === ':id' && route.params['id']
    ? route.params['id'].replace(/_/g, ' ')
    : label;

    breadcrumbs.push({
      label: resolvedLabel,
      url
    });
  }
  if(route.firstChild){
    return this.build(route.firstChild, url, breadcrumbs);
  }
  return breadcrumbs;
}
}
