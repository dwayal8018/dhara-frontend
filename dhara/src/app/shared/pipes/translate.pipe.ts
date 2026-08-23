import { inject, Pipe, PipeTransform } from '@angular/core';
import { AppSettingsService } from '../../core/services/app-settings.service';
import { TRANSLATIONS } from '../../core/constants/translations';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Set pure: false so it updates immediately when the language signal updates
})
export class TranslatePipe implements PipeTransform {
  private readonly settings = inject(AppSettingsService);

  transform(key: string): string {
    const currentLang = this.settings.language();
    return TRANSLATIONS[currentLang]?.[key] ?? key;
  }
}
