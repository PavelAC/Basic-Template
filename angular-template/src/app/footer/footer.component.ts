import { Component, OnInit } from '@angular/core';
import { FooterService, Social } from './footer.service'; // Adjust the import path as necessary
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  socials: Social[] = [];

  constructor(private footerService: FooterService) {}

  ngOnInit(): void {
    this.socials = this.footerService.getSocials();
    console.log(this.socials);
  }
}
