import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatDividerModule, MatIconModule],
  template: `
    <footer style="background:#3f51b5;color:rgba(255,255,255,0.87);margin-top:auto;padding:32px 16px 16px;">
      <div style="max-width:1280px;margin:0 auto;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px;margin-bottom:24px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <mat-icon>menu_book</mat-icon>
              <span style="font-size:18px;font-weight:600;">E-Bookstore</span>
            </div>
            <p style="font-size:13px;opacity:0.8;margin:0;">
              भारत की अपनी ऑनलाइन किताबों की दुकान।<br>
              Your online bookstore, proudly Indian.
            </p>
          </div>
          <div>
            <p style="font-weight:600;margin:0 0 12px;">Shop</p>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
              <li><a routerLink="/catalogue" style="color:inherit;text-decoration:none;font-size:13px;opacity:0.85;hover:opacity:1">Catalogue</a></li>
              <li><a routerLink="/cart" style="color:inherit;text-decoration:none;font-size:13px;opacity:0.85;">Cart</a></li>
            </ul>
          </div>
          <div>
            <p style="font-weight:600;margin:0 0 12px;">Account</p>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
              <li><a routerLink="/home" style="color:inherit;text-decoration:none;font-size:13px;opacity:0.85;">Order History</a></li>
              <li><a routerLink="/login" style="color:inherit;text-decoration:none;font-size:13px;opacity:0.85;">Login / Register</a></li>
            </ul>
          </div>
          <div>
            <p style="font-weight:600;margin:0 0 12px;">Contact</p>
            <p style="font-size:13px;opacity:0.8;margin:0;">
              support&#64;ebookstore.in<br>
              +91 80 4567 8900<br>
              Mon–Sat, 10 AM – 7 PM IST
            </p>
          </div>
        </div>
        <mat-divider style="border-color:rgba(255,255,255,0.2);margin-bottom:16px;"></mat-divider>
        <p style="text-align:center;font-size:12px;opacity:0.65;margin:0;">
          &copy; {{ year }} E-Bookstore India Pvt. Ltd. All rights reserved. | CIN: U52109MH2024PTC000001
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
