import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppSettingsService } from './app-settings.service';
import { AuthService } from './auth.service';
import { Language, ThemeMode } from '../../features/settings/settings/settings.data';

export interface AssistantAction {
  type: 'navigate' | 'theme_change' | 'lang_change';
  payload: any;
  btnLabel?: string;
}

export interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  action?: AssistantAction;
}

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private readonly settings = inject(AppSettingsService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  messages = signal<Message[]>([
    {
      sender: 'assistant',
      text: 'Namaste! I am Dhara AI. Speak or type to ask me about today\'s sales, outstanding dues, low stock alerts, or to change settings like theme and language! (English, हिंदी, मराठी)',
      timestamp: new Date()
    }
  ]);

  isListening = signal<boolean>(false);
  private recognition: any = null;

  constructor() {
    this._initSpeechRecognition();
  }

  // ── Speech Recognition Lifecycle ──────────────────────────────────────────
  private _initSpeechRecognition() {
    const SpeechObj = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechObj) return;

    this.recognition = new SpeechObj();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => {
      this.isListening.set(true);
    };

    this.recognition.onend = () => {
      this.isListening.set(false);
    };

    this.recognition.onerror = () => {
      this.isListening.set(false);
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        this.processQuery(transcript);
      }
    };
  }

  startListening() {
    if (!this.recognition) {
      this._addSystemMessage('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }
    // Set recognition language based on active settings
    const lang = this.settings.language();
    if (lang === 'Hindi') this.recognition.lang = 'hi-IN';
    else if (lang === 'Marathi') this.recognition.lang = 'mr-IN';
    else this.recognition.lang = 'en-IN';

    try {
      this.recognition.start();
    } catch (e) {
      this.recognition.stop();
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // ── Query Processing (NLP Parser) ──────────────────────────────────────────
  processQuery(text: string) {
    if (!text.trim()) return;

    // 1. Add user message
    this.messages.update(prev => [...prev, {
      sender: 'user',
      text,
      timestamp: new Date()
    }]);

    // 2. Parse intent
    const q = text.toLowerCase().trim();
    let reply = '';
    let action: AssistantAction | undefined;

    // --- Intent: Sales / Revenue ---
    if (
      q.includes('sales') || q.includes('profit') || q.includes('sell') || q.includes('revenue') ||
      q.includes('बिक्री') || q.includes('मुनाफा') || q.includes('कमाई') ||
      q.includes('विक्री') || q.includes('नफा') ||
      q.includes('सेल') || q.includes('प्रॉफिट') || q.includes('रेवेन्यू') || q.includes('रेव्हेन्यू')
    ) {
      reply = 'Today\'s Sales total is ₹1,48,230 across 12 transactions, generating a profit of ₹41,280. Click below to view the full Sales register.';
      action = {
        type: 'navigate',
        payload: '/sales',
        btnLabel: 'Go to Sales'
      };
    }
    // --- Intent: Outstanding Dues / Udhaar ---
    else if (
      q.includes('outstanding') || q.includes('owe') || q.includes('borrower') || q.includes('due') ||
      q.includes('balance') || q.includes('उधार') || q.includes('बाकी') || q.includes('पैसे किसके') ||
      q.includes('उधारी') || q.includes('कोणाचे पैसे') ||
      q.includes('आउटस्टैंडिंग') || q.includes('आऊटस्टँडिंग') || q.includes('बैलेंस') || q.includes('बॅलन्स') || q.includes('ड्यू')
    ) {
      reply = 'Your total outstanding customer dues is ₹1,64,000. Top borrowers are: Mahesh Bhosale (₹52,000, 42 days overdue) and Rajesh Patil (₹38,000, 18 days overdue). Would you like to view the Customer Book?';
      action = {
        type: 'navigate',
        payload: '/customers',
        btnLabel: 'Open Customer Book'
      };
    }
    // --- Intent: Inventory / Low Stock ---
    else if (
      q.includes('stock') || q.includes('inventory') || q.includes('low') ||
      q.includes('सामान') || q.includes('खत्म') || q.includes('माल') ||
      q.includes('साहित्य') || q.includes('कमी') ||
      q.includes('स्टॉक') || q.includes('इन्वेंटरी') || q.includes('इन्व्हेन्टरी') || q.includes('लो')
    ) {
      reply = 'Alert: You have 3 items running low on stock: PVC Pipe 1 inch (8 left), Brass Elbow (2 left), and Teflon Tape (15 left). Restock soon to avoid shortages!';
      action = {
        type: 'navigate',
        payload: '/inventory',
        btnLabel: 'View Inventory'
      };
    }
    // --- Intent: Switch Theme to Dark ---
    else if (
      q.includes('dark theme') || q.includes('dark mode') ||
      q.includes('डार्क थीम') || q.includes('डार्क मोड') ||
      q.includes('काळ थीम') || q.includes('काळ मोड') ||
      q.includes('ब्लॅक मोड')
    ) {
      this.settings.themeMode.set('dark');
      reply = 'Switched to Dark Theme 🌙';
      action = {
        type: 'theme_change',
        payload: 'dark'
      };
    }
    // --- Intent: Switch Theme to Light ---
    else if (
      q.includes('light theme') || q.includes('light mode') ||
      q.includes('लाइट थीम') || q.includes('लाइट मोड') ||
      q.includes('प्रकाश थीम') || q.includes('पांढरा मोड') ||
      q.includes('व्हाईट मोड')
    ) {
      this.settings.themeMode.set('light');
      reply = 'Switched to Light Theme ☀️';
      action = {
        type: 'theme_change',
        payload: 'light'
      };
    }
    // --- Intent: Language Switch to Hindi ---
    else if (q.includes('hindi') || q.includes('हिंदी')) {
      this.settings.language.set('Hindi');
      reply = 'भाषा को बदलकर हिंदी कर दिया गया है। 🇮🇳';
      action = {
        type: 'lang_change',
        payload: 'Hindi'
      };
    }
    // --- Intent: Language Switch to Marathi ---
    else if (q.includes('marathi') || q.includes('मराठी')) {
      this.settings.language.set('Marathi');
      reply = 'भाषा बदलून मराठी करण्यात आली आहे. 🚩';
      action = {
        type: 'lang_change',
        payload: 'Marathi'
      };
    }
    // --- Intent: Language Switch to English ---
    else if (q.includes('english') || q.includes('अंग्रेजी') || q.includes('इंग्रजी') || q.includes('इंग्लिश') || q.includes('इंग्रजीत') || q.includes('इंग्रजीमध्ये')) {
      this.settings.language.set('English');
      reply = 'Language switched to English. 🇬🇧';
      action = {
        type: 'lang_change',
        payload: 'English'
      };
    }
    // --- Intent: Users / Staff members ---
    else if (
      q.includes('user') || q.includes('staff') || q.includes('employee') || q.includes('member') || q.includes('login') ||
      q.includes('कर्मचारी') || q.includes('स्टाफ') || q.includes('कामगार') || q.includes('लॉगिन') || q.includes('लॉग इन') ||
      q.includes('युजर्स') || q.includes('यूजर्स') || q.includes('एम्प्लॉई')
    ) {
      const currentUser = this.auth.currentUser();
      const totalUsers = this.settings.users().length;
      const activeUsers = this.settings.users().filter(u => u.status === 'Active').length;

      if (q.includes('login') || q.includes('logged') || q.includes('लॉगिन') || q.includes('लॉग इन')) {
        reply = `The currently logged-in user is ${currentUser?.name || 'unknown'} (${currentUser?.role || 'Guest'}). There are ${totalUsers} total staff members configured.`;
      } else {
        reply = `Dhara has ${totalUsers} total staff members registered (${activeUsers} active, ${totalUsers - activeUsers} inactive). You can manage them in settings.`;
      }
      action = {
        type: 'navigate',
        payload: '/settings',
        btnLabel: 'Manage Users & Staff'
      };
    }
    // --- Intent: Help / Hello ---
    else if (
      q.includes('hi') || q.includes('hello') || q.includes('नमस्ते') || q.includes('नमस्कार') || q.includes('help') || q.includes('मदद') || q.includes('मदत') ||
      q.includes('हाय') || q.includes('हॅलो') || q.includes('स्टेटस') || q.includes('अपडेट') || q.includes('चालू') || q.includes('सुरू')
    ) {
      reply = 'You can ask me questions in your language, such as:\n• "What is today\'s sales?" (आज की बिक्री क्या है?)\n• "Show low stock products" (कम स्टॉक दिखाओ)\n• "Who owes me money?" (उधार किसका बाकी है?)\n• "Change theme to dark" (डार्क मोड करो)';
    }
    // --- Fallback ---
    else {
      reply = 'I did not quite understand that. Try asking about "today\'s sales", "outstanding balances", "low stock items", or setting preferences in English, Hindi, or Marathi!';
    }

    // 3. Add assistant response
    setTimeout(() => {
      this.messages.update(prev => [...prev, {
        sender: 'assistant',
        text: reply,
        timestamp: new Date(),
        action
      }]);
    }, 600); // 600ms delay to feel more natural and responsive
  }

  executeAction(action: AssistantAction) {
    if (action.type === 'navigate') {
      this.router.navigate([action.payload]);
    } else if (action.type === 'theme_change') {
      this.settings.themeMode.set(action.payload as ThemeMode);
    } else if (action.type === 'lang_change') {
      this.settings.language.set(action.payload as Language);
    }
  }

  private _addSystemMessage(text: string) {
    this.messages.update(prev => [...prev, {
      sender: 'assistant',
      text,
      timestamp: new Date()
    }]);
  }
}
