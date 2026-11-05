# English Vocabulary Game for Kids — Angular 20 · TypeScript

A playful English–Hebrew vocabulary trainer for children. Each child has their own profile and word list, and practices through a multiple-choice game with spoken pronunciation, sound effects and a score summary.

The interface is in Hebrew (RTL).

> 🤖 **Built with AI:** I came up with the idea and the features, generated the code with an AI coding assistant, and tested the app. I built it for real-world use with my family, not as a study project.

---

## Features

- **Multiple profiles:** each child gets a separate profile with a personal word list
- **Word management:** add English–Hebrew word pairs, reset the list, or print it as a study sheet
- **Quiz game:** shows an English word with randomly generated answer options. The child picks the correct Hebrew translation
- **Pronunciation:** reads each English word aloud with the browser's Web Speech API (`speechSynthesis`)
- **Feedback:** sound effects for correct and wrong answers, a running score, and an end-of-game summary
- **Persistence:** profiles and words are saved in `localStorage`, so progress survives a page refresh. No backend needed

---

## Tech stack

- **Angular 20** with standalone components
- **TypeScript**
- Angular template-driven forms (`FormsModule`, `ngModel`)
- SCSS
- Web Speech API · Web Storage API

---

## Getting started

```bash
npm install
npm start          # or: ng serve
```

Open `http://localhost:4200`.

### Build

```bash
ng build
```

---

## Project structure

```
src/
├── main.ts          # bootstraps the standalone app
├── app/
│   ├── app.ts       # game component: profiles, words, quiz logic, speech
│   ├── app.config.ts
│   └── app.routes.ts
└── styles.scss
```
