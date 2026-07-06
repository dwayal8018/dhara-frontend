import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

  // Expose to template as a computed read
  collapsed = this.settings.sidebarCollapsed;

  onCollapseToggle(val: boolean): void {
    this.settings.sidebarCollapsed.set(val);
  }

}
