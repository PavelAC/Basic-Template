import { Component, OnInit, Input } from '@angular/core';
import { HeaderService, NavbarItem } from '../header.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  navbarItems: NavbarItem[] = [];
  
  @Input() isVisible: boolean = true;
  isListVisible: boolean = false;
  constructor(private headerService: HeaderService) {}
  ngOnInit(): void {
    this.navbarItems = this.headerService.getNavbarItems();
    console.log(this.navbarItems);
  }

  toggleListVisibility(): void {
    this.isListVisible = !this.isListVisible;
  }
}
