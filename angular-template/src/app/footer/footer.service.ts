import { Injectable } from '@angular/core';

export interface Social{
  id: string,
  icon: string,
  link: string,
}

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private socials: Social[] = [
    { id: '1', icon: 'fa fa-facebook', link: 'https://www.facebook.com' },
    { id: '2', icon: 'fa fa-instagram', link: 'https://www.instagram.com' },
    { id: '3', icon: 'fa fa-github', link: 'https://www.github.com' },
    { id: '4', icon: 'fa fa-linkedin', link: 'https://www.linkedin.com' },
    { id: '5', icon: 'fa fa-x', link: 'https://www.x.com' },
    { id: '6', icon: 'fa fa-tiktok', link: 'https://www.tiktok.com' }
  ];

  getSocials(): Social[] {
    return this.socials;
  }

  constructor() { }
}
