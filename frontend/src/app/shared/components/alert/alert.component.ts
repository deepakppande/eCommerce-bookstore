import { Component, Input, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div [class]="containerClass" role="alert" style="display:flex;align-items:center;gap:8px;border-radius:4px;padding:12px 16px;margin-bottom:16px;font-size:14px;">
      <mat-icon style="font-size:20px;width:20px;height:20px;">{{ icon }}</mat-icon>
      <span>{{ message }}</span>
    </div>
  `,
})
export class AlertComponent {
  @Input() message = '';
  @Input() type: 'error' | 'success' | 'info' | 'warning' = 'error';

  get icon(): string {
    return { error: 'error', success: 'check_circle', info: 'info', warning: 'warning' }[this.type];
  }

  get containerClass(): string {
    const map = {
      error:   'alert-error',
      success: 'alert-success',
      info:    'alert-info',
      warning: 'alert-warning',
    };
    return map[this.type];
  }
}
