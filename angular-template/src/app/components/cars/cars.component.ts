import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService, Manufacturer, Model, CarDetail } from '../../services/car.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {
  manufacturers: Manufacturer[] = [];
  models: Model[] = [];
  selectedManufacturer: string = '';
  selectedModel: string = '';
  carDetails: CarDetail | null = null;
  errorMessage: string = '';

  constructor(private carService: CarService, private loadingService: LoadingService) {}

  ngOnInit() {
    this.loadManufacturers();
  }

  loadManufacturers() {
    this.loadingService.show();
    this.carService.getManufacturers().subscribe({
      next: (data: Manufacturer[]) => {
        this.manufacturers = data;
        this.loadingService.hide();
      },
      error: (error) => {
        this.errorMessage = 'Error loading manufacturers.';
        console.error('Error loading manufacturers:', error);
        this.loadingService.hide();
      }
    });
  }

  onManufacturerChange() {
    if (this.selectedManufacturer) {
      this.loadingService.show();
      this.carService.getModels(this.selectedManufacturer).subscribe({
        next: (data: Model[]) => {
          this.models = data;
          this.loadingService.hide();
        },
        error: (error) => {
          this.errorMessage = 'Error fetching models.';
          console.error('Error fetching models:', error);
          this.loadingService.hide();
        }
      });
    } else {
      this.models = [];
    }
    this.selectedModel = '';
    this.carDetails = null;
  }

  onModelChange() {
    if (this.selectedManufacturer && this.selectedModel) {
      this.loadingService.show();
      this.carService.getCarDetails(this.selectedManufacturer, this.selectedModel).subscribe({
        next: (data: CarDetail[]) => {
          console.log('Car Details API Response:', data);
          if (data.length > 0) {
            this.carDetails = data[0]; 
          } else {
            this.carDetails = null;
            this.errorMessage = 'No data available for this model (limited to 2015-2020).';
          }
          this.loadingService.hide();
        },
        error: (error) => {
          this.errorMessage = 'Error fetching car details.';
          console.error('Error fetching car details:', error);
          this.loadingService.hide();
        }
      });
    } else {
      this.carDetails = null;
    }
  }
}
