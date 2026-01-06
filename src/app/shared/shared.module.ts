// Dans shared.module.ts, MODIFIEZ :
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './components/ui/button/button.component';
import { CardComponent } from './components/ui/card/card.component';
import { BadgeComponent } from './components/ui/badge/badge.component';
import { LoadingComponent } from './components/ui/loading/loading.component';
import { LogoComponent } from './components/ui/logo/logo.component';
// MapComponent n'est PAS importé ici

@NgModule({
  declarations: [
    // MapComponent est retiré car il est standalone
  ],
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    LoadingComponent,
    LogoComponent
  ],
  exports: [
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    LoadingComponent,
    LogoComponent
    // MapComponent retiré
  ]
})
export class SharedModule { }