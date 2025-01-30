import { Component, OnInit } from '@angular/core';
import { HeaderService } from './header.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isSidebarVisible = false;
  menuData: any;
  currentLanguage = 'en';

  constructor(
    private headerService: HeaderService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.configService.loadTranslations(this.currentLanguage);

    this.configService.translations$.subscribe((translations) => {
      console.log('Translations:', translations);
      if (translations) {
        this.menuData = translations.menu;
      }
    });
  }

  toggleSidebarVisibility() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  changeLanguage(event: any) {
    const lang = event.target.value;
    this.configService.loadTranslations(lang);
    this.currentLanguage = lang;
    console.log('language: ', lang);
  }
}