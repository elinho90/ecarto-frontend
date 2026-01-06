import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  @Input() variant: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() dot = false;
  @Input() pill = true;
  @Input() outline = false;
  @Input() icon?: string;
  
  @HostBinding('class')
  get hostClasses(): string {
    const classes = [];
    classes.push(`badge-${this.variant}`);
    if (this.size !== 'md') classes.push(`badge-${this.size}`);
    if (this.pill) classes.push('badge-pill');
    if (this.outline) classes.push('badge-outline');
    return classes.join(' ');
  }
}