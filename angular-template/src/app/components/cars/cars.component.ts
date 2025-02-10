import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService, Manufacturer, Model, CarDetail } from '../../services/car.service';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css'],
})
export class CarsComponent implements OnInit {
  manufacturers: Manufacturer[] = [];
  models: Model[] = [];
  selectedManufacturer: string = '';
  selectedModel: string = '';
  carDetails: CarDetail | null = null;
  errorMessage: string = '';

  constructor(private carService: CarService) {}

  ngOnInit() {
    this.loadManufacturers();
  }

  loadManufacturers() {
    this.carService.getManufacturers().subscribe({
      next: (data: Manufacturer[]) => {
        this.manufacturers = data;
      },
      error: (error) => {
        this.errorMessage = 'Error loading manufacturers.';
        console.error('Error loading manufacturers:', error);
      },
    });
  }

  onManufacturerChange() {
    if (this.selectedManufacturer) {
      this.carService.getModels(this.selectedManufacturer).subscribe({
        next: (data: Model[]) => {
          this.models = data;
        },
        error: (error) => {
          this.errorMessage = 'Error fetching models.';
          console.error('Error fetching models:', error);
        },
      });
    } else {
      this.models = [];
    }
    this.selectedModel = '';
    this.carDetails = null;
  }

  onModelChange() {
    if (this.selectedManufacturer && this.selectedModel) {
      this.carService.getCarDetails(this.selectedManufacturer, this.selectedModel).subscribe({
        next: (data: CarDetail[]) => {
          console.log('Car Details API Response:', data);
          if (data.length > 0) {
            this.carDetails = data[0]; 
          } else {
            this.carDetails = null;
            this.errorMessage = 'No data available for this model (limited to 2015-2020).';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error fetching car details.';
          console.error('Error fetching car details:', error);
        },
      });
    } else {
      this.carDetails = null;
    }
  }
  
}