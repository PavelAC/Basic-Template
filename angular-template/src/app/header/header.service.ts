import { Injectable } from '@angular/core';

export interface NavbarItem {
  id: string;
  label: string;
  link: string;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private navbarItems: NavbarItem[] = [
    { id:'1', label: 'Home', link: '/' },
    { id:'2', label: 'About', link: '/about' },
    { id:'3', label: 'Services', link: '/services' },
    { id:'4', label: 'Contact', link: '/contact' },
  ];

  getNavbarItems(): NavbarItem[]{
    return this.navbarItems
  }

  constructor() { }
}
