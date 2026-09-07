import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { AppSettingsService } from '../../core/services/app-settings.service';

@Component({
  selector: 'dh-app-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShell {

  private readonly settings = inject(AppSettingsService);
  private readonly router = inject(Router);

  // Expose to template as a computed read
  collapsed = this.settings.sidebarCollapsed;
  mobileNavOpen = this.settings.mobileNavOpen;

  constructor() {
    // Auto-close the mobile drawer whenever the route changes
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.settings.mobileNavOpen.set(false);
      }
    });
  }

  onCollapseToggle(val: boolean): void {
    this.settings.sidebarCollapsed.set(val);
  }

  toggleMobileNav(): void {
    this.settings.mobileNavOpen.update(v => !v);
  }

  closeMobileNav(): void {
    this.settings.mobileNavOpen.set(false);
  }

}
