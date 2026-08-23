import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistantService, AssistantAction } from '../../core/services/assistant.service';

@Component({
  selector: 'dh-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant.html',
  styleUrl: './assistant.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Assistant {
  private readonly svc = inject(AssistantService);

  @ViewChild('messageLog') private messageLog!: ElementRef<HTMLDivElement>;

  isOpen = signal<boolean>(false);
  inputText = '';

  readonly messages = this.svc.messages;
  readonly isListening = this.svc.isListening;

  readonly suggestionChips = [
    "Today's Sales",
    "किसका उधार बाकी है?",
    "Show low stock",
    "डार्क मोड करो",
    "मराठी करा"
  ];

  constructor() {
    // Scroll to bottom when messages signal changes
    effect(() => {
      // Access the signal to track it
      this.messages();
      this.scrollToBottom();
    });
  }

  togglePanel() {
    this.isOpen.update(o => !o);
    this.scrollToBottom();
  }

  toggleListening() {
    if (this.isListening()) {
      this.svc.stopListening();
    } else {
      this.svc.startListening();
    }
  }

  sendText() {
    if (!this.inputText.trim()) return;
    this.svc.processQuery(this.inputText);
    this.inputText = '';
  }

  selectSuggestion(chip: string) {
    this.svc.processQuery(chip);
  }

  executeAction(action: AssistantAction) {
    this.svc.executeAction(action);
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm}`;
  }

  private scrollToBottom() {
    setTimeout(() => {
      try {
        if (this.messageLog?.nativeElement) {
          const el = this.messageLog.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
      } catch (err) {
        // ignore
      }
    }, 100);
  }
}
