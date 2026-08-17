import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div style="display:flex;justify-content:center;align-items:center;padding:48px;">
      <mat-spinner diameter="48"></mat-spinner>
    </div>
  `,
})
export class SpinnerComponent {}
