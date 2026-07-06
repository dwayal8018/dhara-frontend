import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dh-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {

  sidebarCollapsed = input<boolean>(false);

  readonly shopName = 'DHARA Business';
  readonly userName = 'Dnyaneshwari';
  readonly date = new Date();
  readonly notificationCount = 5;

}
