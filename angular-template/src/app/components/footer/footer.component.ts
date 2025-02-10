import { Component, OnInit } from '@angular/core';
import { FooterService } from '../../services/footer.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Import DomSanitizer

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  footerData: any = null;

  constructor(
    private footerService: FooterService,
    private sanitizer: DomSanitizer // Inject DomSanitizer
  ) {}

  ngOnInit(): void {
    this.footerService.getSocials().subscribe({
      next: (data: any) => {
        this.footerData = data;
        // Sanitize SVG content for each element
        this.footerData.elements.forEach((element: any) => {
          if (element.svg) {
            element.safeSvg = this.sanitizer.bypassSecurityTrustHtml(element.svg);
          }
        });
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