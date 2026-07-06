import {
  ChangeDetectionStrategy,
  Component,
  signal
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';

@Component({
  selector: 'dh-app-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShell {

  collapsed = signal(false);

  onCollapseToggle(val: boolean): void {
    this.collapsed.set(val);
  }

}
