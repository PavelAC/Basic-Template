import { Component, Input, OnInit } from '@angular/core';
import { HeaderService, NavbarItem } from '../header.service';
import { ActivatedRouteSnapshot, ResolveFn, RouterModule, RouterStateSnapshot } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  navbarItems: NavbarItem[] = [];

  @Input() isVisible: boolean = true;

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    this.navbarItems = this.headerService.getNavbarItems();
    console.log(this.navbarItems);
  }
}
