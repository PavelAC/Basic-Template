import { Component, OnInit } from '@angular/core';
import { FooterService } from './footer.service'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  footerData: any =null;

  constructor(private footerService: FooterService) {}

  ngOnInit(): void {
    this.footerService.getSocials().subscribe({
      next: (data: any) => {
        this.footerData = data;
        console.log('Footer Data:', this.footerData);
      },
      error: (error) => {
        console.error('Error fetching footer data:', error);
      },
      complete: () => {
        console.log('Footer data fetching completed.');
      }
    });
    
  }
}
