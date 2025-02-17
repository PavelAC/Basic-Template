import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

interface UserPreferences {
  theme: string;
  language: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css' , './header2.component.css'],
})
export class HeaderComponent implements OnInit {
  isSidebarVisible = false;
  menuData: any;
  currentLanguage = 'en';
  userId: string | null = null;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    this.authService.user.subscribe(async (user) => {
      this.userId = user ? user.id : null;

      if (this.userId) {
        await this.loadPreferences();
      } else {
        this.loadFromLocalStorage();
      }

      this.configService.loadTranslations(this.currentLanguage);
      this.configService.translations$.subscribe((translations) => {
        if (translations) {
          this.menuData = translations.menu;
        }
      });
    });
  }

  async loadPreferences() {
    if (!this.userId) return;

    const userDoc = doc(this.firestore, `users/${this.userId}`);
    const userSnap = await getDoc(userDoc);

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserPreferences;
      this.currentLanguage = userData.language || 'en';
      this.applyTheme(userData.theme || 'light');
    } else {
      this.loadFromLocalStorage();
    }
  }

  loadFromLocalStorage() {
    const storedTheme = localStorage.getItem('theme');
    this.applyTheme(storedTheme || 'light');

    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      this.currentLanguage = storedLanguage;
    }
  }

  async changeLanguage(event: any) {
    this.currentLanguage = event.target.value;
    this.configService.loadTranslations(this.currentLanguage);
    console.log('Language changed to:', this.currentLanguage);

    // Update both selectors
    const selectors = document.querySelectorAll('.language-selector select');
    selectors.forEach((select) => {
      (select as HTMLSelectElement).value = this.currentLanguage;
    });


    if (this.userId) {
      await this.updatePreferences();
    } else {
      localStorage.setItem('language', this.currentLanguage);
    }
  }


  async toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    const theme = isDark ? 'dark' : 'light';

    if (this.userId) {
      await this.updatePreferences();
    } else {
      localStorage.setItem('theme', theme);
    }
  }

  applyTheme(theme: string) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  async updatePreferences() {
    if (!this.userId) return;

    const userDoc = doc(this.firestore, `users/${this.userId}`);
    await setDoc(userDoc, {
      language: this.currentLanguage,
      theme: document.body.classList.contains('dark-theme') ? 'dark' : 'light',
    }, { merge: true });
    this.authService.user.subscribe((user) => {
      console.log("User Object:", user);
      console.log("User ID:", user?.id);
      // console.log("Email Verified:", user?.emailVerified);
    });
    
  }

  toggleSidebarVisibility() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  async logout() {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

}
