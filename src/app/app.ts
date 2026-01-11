import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Word {
  english: string;
  hebrew: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="container">
    <h1>🌈 משחק מילים באנגלית 🌈</h1>

    <!-- בחירת פרופיל -->
    <div class="card" *ngIf="!activeProfile">
      <h2>👧 בחרי משתמשת</h2>
      <input [(ngModel)]="newProfile" placeholder="שם הילדה" />
      <button (click)="addProfile()">הוספה</button>
      <ul>
        <li *ngFor="let p of profiles">
          {{ p }} <button (click)="selectProfile(p)">בחירה</button>
        </li>
      </ul>
    </div>

    <!-- ניהול מילים -->
    <div class="card" *ngIf="activeProfile">
      <h2>➕ הוספת מילה</h2>
      <input [(ngModel)]="english" placeholder="מילה באנגלית" (keyup.enter)="addWord()" />
      <input [(ngModel)]="hebrew" placeholder="תרגום לעברית" (keyup.enter)="addWord()" />
      <button (click)="addWord()">שמור</button>
      <button class="danger" (click)="resetWords()">איפוס רשימה</button>
      <button (click)="printWords()">🖨️ הדפסה</button>

      <p>סה"כ מילים: {{ words.length }}</p>
    </div>

    <!-- הגדרות משחק -->
    <div class="card" *ngIf="words.length > 0 && !currentWord && !gameFinished">
      <h2>⚙️ הגדרות משחק</h2>
      <p>כיוון:</p>
      <button [class.selected]="quizDirection==='en-he'" (click)="quizDirection='en-he'">אנגלית ➜ עברית</button>
      <button [class.selected]="quizDirection==='he-en'" (click)="quizDirection='he-en'">עברית ➜ אנגלית</button>

      <p>סוג מבחן:</p>
      <button [class.selected]="quizType==='open'" (click)="quizType='open'">✏️ כתיבה</button>
      <button [class.selected]="quizType==='mc'" (click)="quizType='mc'">📝 אמריקאי</button>

      <button class="start" (click)="startGame()">🎮 התחל משחק</button>
    </div>

    <!-- משחק -->
    <div class="card quiz" *ngIf="currentWord">
      <p>התקדמות: {{ currentIndex + 1 }} / {{ gameWords.length }}</p>
      <div class="progress">
        <div class="bar" [style.width.%]="progress"></div>
      </div>

      <h3>{{ quizDirection === 'en-he' ? currentWord.english : currentWord.hebrew }}</h3>
      <button *ngIf="quizDirection==='en-he'" (click)="speak(currentWord.english)">🔊 השמע</button>

      <!-- פתוח -->
      <div *ngIf="quizType==='open'">
        <input [(ngModel)]="answer" placeholder="כתבי תשובה" />
        <button (click)="checkAnswer()">בדיקה</button>
      </div>

      <!-- אמריקאי -->
      <div *ngIf="quizType==='mc'">
        <p class="hint">(תרגום מעברית לאנגלית)</p>
        <button class="option" *ngFor="let o of options" (click)="checkAnswer(o)">{{ o }}</button>
      </div>

      <p class="result">{{ result }}</p>
      <p class="score">⭐ ניקוד: {{ score }}</p>
      <button class="danger" (click)="quitGame()">💤 לוותר על המשחק</button>
    </div>

    <!-- סיום -->
    <div class="card" *ngIf="gameFinished">
      <h2>🏆 כל הכבוד {{ activeProfile }}!</h2>
      <p>ניקוד סופי: {{ score }}</p>
      <button (click)="restartGame()">שחקי שוב</button>
    </div>
  </div>
  `,
  styles: [`
    :host { direction: rtl; display: block; font-family: Arial; text-align: right; }
    .container { max-width: 1200px; margin: auto; background:#fff6fb; padding:20px; border-radius:16px; }
    h1 { text-align:center; color:#d63384; }
    .card { background:white; padding:16px; margin:16px 0; border-radius:14px; box-shadow:0 6px 12px rgba(0,0,0,0.1); }
    input { padding:10px; width:80%; margin:6px; }
    button { padding:10px 16px; margin:4px; border:none; border-radius:10px; background:#ff7ab6; color:white; }
    .danger { background:#ff5252; }
    .start { background:#4caf50; }
    .option { display:block; width:80%; margin:6px auto; background:#6f42c1; }
    .progress { background:#eee; height:12px; border-radius:6px; margin:8px 0; }
    .bar { height:12px; background:#ff9800; border-radius:6px; }
    .score { font-weight:bold; color:#ff9800; }
    button.selected { border: 2px solid #4caf50; }
  `]
})
export class AppComponent implements OnInit {
  profiles: string[] = [];
  newProfile = '';
  activeProfile: string | null = null;

  words: Word[] = [];
  english = '';
  hebrew = '';

  quizDirection: 'en-he' | 'he-en' = 'en-he';
  quizType: 'open' | 'mc' = 'open';
  gameWords: Word[] = [];
  currentIndex = 0;
  currentWord: Word | null = null;
  answer = '';
  options: string[] = [];
  score = 0;
  result = '';
  gameFinished = false;

  get progress() {
    if (!this.gameWords || this.gameWords.length === 0) return 0;
    return (this.currentIndex / this.gameWords.length) * 100;
  }

  ngOnInit() {
    this.loadFromStorage();
  }

  addProfile() {
    if (this.newProfile) {
      this.profiles.push(this.newProfile);
      localStorage.setItem('profiles', JSON.stringify(this.profiles));
      this.newProfile = '';
    }
  }

  selectProfile(p: string) {
    this.activeProfile = p;
    this.words = JSON.parse(localStorage.getItem('words_' + p) || '[]');
  }

  addWord() {
    if (this.english && this.hebrew) {
      this.words.push({ english: this.english, hebrew: this.hebrew });
      this.saveWords();
      this.english = this.hebrew = '';
    }
  }

  saveWords() {
    if (this.activeProfile) {
      localStorage.setItem('words_' + this.activeProfile, JSON.stringify(this.words));
    }
  }

  resetWords() {
    this.words = [];
    this.saveWords();
  }

  printWords() {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const rows = this.words.map(w => `<tr><td>${w.english}</td><td>${w.hebrew}</td></tr>`).join('');

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>רשימת מילים להדפסה</title>
          <style>
            body { font-family: Arial; direction: rtl; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>📄 רשימת מילים באנגלית</h1>
          <table>
            <tr><th>אנגלית</th><th>עברית</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }

  startGame() {
    this.gameWords = [...this.words].sort(() => Math.random() - 0.5);
    this.currentIndex = 0;
    this.score = 0;
    this.gameFinished = false;
    this.loadWord();
  }

  quitGame() {
    this.currentWord = null;
    this.gameFinished = false;
  }

  loadWord() {
    if (this.currentIndex < this.gameWords.length) {
      this.currentWord = this.gameWords[this.currentIndex];
      this.answer = '';
      this.result = '';
      this.generateOptions();
    } else {
      this.currentWord = null;
      this.gameFinished = true;
    }
  }

  checkAnswer(selected?: string) {
    if (!this.currentWord) return;
    const correct = this.quizType === 'mc' ? this.currentWord.english : (this.quizDirection === 'en-he' ? this.currentWord.hebrew : this.currentWord.english);
    const userAnswer = this.quizType === 'mc' ? selected : this.answer;

    if (userAnswer?.toLowerCase().trim() === correct.toLowerCase()) {
      this.playSound(true);
      this.score += 10;
      this.currentIndex++;
      this.result = '✅ נכון!';
      setTimeout(() => this.loadWord(), 600);
    } else {
      this.playSound(false);
      this.result = '❌ לא נכון';
    }
  }

  generateOptions() {
    if (this.quizType !== 'mc' || !this.currentWord) return;

    const correct = this.currentWord.english;
    const questionWord = this.currentWord.hebrew;

    const pool = this.words.map(w => w.english).filter(w => w !== correct).sort(() => Math.random() - 0.5).slice(0, 3);

    this.options = [correct, ...pool].sort(() => Math.random() - 0.5);
    this.currentWord = { english: correct, hebrew: questionWord };
    this.quizDirection = 'he-en';
  }

  speak(word: string) {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    speechSynthesis.speak(u);
  }

  playSound(success: boolean) {
    const audio = new Audio(success ? 'https://actions.google.com/sounds/v1/cartoon/pop.ogg' : 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
    audio.volume = 0.4;
    audio.play();
  }

  restartGame() {
    this.currentWord = null;
    this.gameFinished = false;
  }

  loadFromStorage() {
    this.profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  }
}
