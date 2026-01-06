import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-wrapper" [style.transform]="'scale(' + scale + ')'">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" fill="none" 
           [style.width]="showText ? '150px' : '45px'" [style.height]="'auto'" class="logo-svg">
        <defs>
          <linearGradient id="networkGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FF8C00" />
            <stop offset="100%" stop-color="#1A237E" />
          </linearGradient>
          
          <style>
            .pulse-circle {
              animation: logo-pulse 2s infinite ease-out;
              transform-origin: 45px 55px;
            }
            @keyframes logo-pulse {
              0% { transform: scale(0.5); opacity: 0.8; }
              100% { transform: scale(2.5); opacity: 0; }
            }
          </style>
        </defs>

        <g transform="translate(10, 5)">
          <path d="M25 75 L10 45 L30 10 L70 10 L85 40 L65 85 L25 75Z" 
                stroke="#1A237E" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                fill="rgba(244, 247, 254, 0.5)" />

          <g stroke="url(#networkGradient)" stroke-width="1.5" stroke-opacity="0.8">
            <line x1="45" y1="55" x2="50" y2="25" />
            <line x1="45" y1="55" x2="20" y2="50" />
            <line x1="45" y1="55" x2="75" y2="50" />
            <line x1="45" y1="55" x2="60" y2="80" />
            <line x1="60" y1="80" x2="30" y2="80" />
          </g>

          <g fill="#1A237E">
            <circle cx="50" cy="25" r="2" /> 
            <circle cx="20" cy="50" r="2" /> 
            <circle cx="75" cy="50" r="2" /> 
            <circle cx="30" cy="80" r="2" /> 
            <circle cx="60" cy="80" r="2.5" fill="#FF8C00"/> 
          </g>

          <circle cx="45" cy="55" r="3.5" fill="#FF8C00" stroke="white" stroke-width="1"/>
          <circle cx="45" cy="55" r="3.5" fill="#FF8C00" class="pulse-circle" opacity="0.5"/>
        </g>

        <g transform="translate(100, 60)" font-family="'Poppins', sans-serif" *ngIf="showText">
          <text font-size="38" font-weight="700">
            <tspan fill="#FF8C00">E-</tspan>
            <tspan fill="#1A237E">Carto</tspan>
          </text>
          <text x="2" y="18" font-size="10" font-weight="500" fill="#64748B" letter-spacing="1.2">
            RÉSEAU PROJETS CI
          </text>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .logo-wrapper {
      display: flex;
      align-items: center;
      user-select: none;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .logo-svg {
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .logo-wrapper:hover .logo-svg {
      filter: drop-shadow(0 4px 12px rgba(26, 35, 126, 0.15));
      transform: translateY(-2px);
    }
  `]
})
export class LogoComponent {
  @Input() showText = true;
  @Input() scale = 1;
}
