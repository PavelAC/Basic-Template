import { Component, HostListener, OnInit } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isNavbarVisible: boolean = true;
  isSideBarVisible: boolean = false;

  ngOnInit(): void {
    this.checkWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkWindowSize();
  }

  private checkWindowSize(): void {
    const width = window.innerWidth;
    if (width > 768) {
      this.isNavbarVisible = true;
      this.isSideBarVisible = false;
      console.log('nav');
    } else {
      this.isNavbarVisible = false;
      this.isSideBarVisible = true;
      console.log('side');
    }
  }
}
