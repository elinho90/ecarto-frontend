import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() type: 'spinner' | 'dots' | 'bars' | 'skeleton' = 'spinner';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'white' = 'primary';
  @Input() text?: string;
  @Input() fullscreen = false;
  @Input() backdrop = false;
  
  get spinnerSize(): string {
    switch (this.size) {
      case 'sm': return '1.5rem';
      case 'lg': return '3rem';
      default: return '2rem';
    }
  }
  
  get dotSize(): string {
    switch (this.size) {
      case 'sm': return '0.5rem';
      case 'lg': return '1rem';
      default: return '0.75rem';
    }
  }
}