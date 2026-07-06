import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { StaffUser } from '../../settings/settings/settings.data';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl:    './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {

  private readonly router   = inject(Router);
  private readonly auth     = inject(AuthService);
  private readonly settings = inject(AppSettingsService);

  // ── Active users list (only Active staff) ────────────────────────────────
  readonly activeUsers = computed(() =>
    this.settings.users().filter(u => u.status === 'Active')
  );

  readonly shopName = computed(() => this.settings.shop().shopName);

  // ── Form state ────────────────────────────────────────────────────────────
  selectedUser = signal<StaffUser | null>(null);
  pin          = signal('');
  error        = signal('');
  loading      = signal(false);
  step         = signal<'pick' | 'pin'>('pick');   // step 1: pick user, step 2: enter PIN

  // ── Step 1: select user ───────────────────────────────────────────────────
  selectUser(user: StaffUser) {
    this.selectedUser.set(user);
    this.pin.set('');
    this.error.set('');
    this.step.set('pin');
  }

  back() {
    this.step.set('pick');
    this.selectedUser.set(null);
    this.pin.set('');
    this.error.set('');
  }

  // ── Step 2: PIN entry (numpad) ────────────────────────────────────────────
  appendDigit(d: string) {
    if (this.pin().length >= 4) return;
    this.pin.update(p => p + d);
    this.error.set('');
    if (this.pin().length === 4) this.submit();
  }

  deleteLast() {
    this.pin.update(p => p.slice(0, -1));
    this.error.set('');
  }

  readonly pinDisplay = computed(() => {
    const filled = this.pin().length;
    return [0, 1, 2, 3].map(i => i < filled);
  });

  // ── Submit ────────────────────────────────────────────────────────────────
  submit() {
    const user = this.selectedUser();
    if (!user) return;

    this.loading.set(true);
    this.error.set('');

    // Simulate a brief async check
    setTimeout(() => {
      const result = this.auth.login(user.phone, this.pin(), this.settings.users());
      this.loading.set(false);

      if (result) {
        this.router.navigateByUrl('/dashboard');
      } else {
        this.pin.set('');
        this.error.set('Incorrect PIN. Try the last 4 digits of your phone number.');
      }
    }, 400);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  avatarColor(key: string)  { return this.auth.avatarColor(key); }
  initials(name: string)    { return this.auth.initials(name); }

  roleColor(role: string): string {
    const map: Record<string, string> = {
      Owner: 'purple', Manager: 'blue', Cashier: 'green', Storekeeper: 'orange',
    };
    return map[role] ?? 'blue';
  }

  readonly numpad      = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  readonly currentYear = new Date().getFullYear();
}
