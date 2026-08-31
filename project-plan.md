# Traktion — Piano di Progetto

## 1. Stack Tecnologico

| Livello | Tecnologia | Motivazione |
|---|---|---|
| **Mobile app** | React Native + Expo + TypeScript | Stack cross-platform più richiesto sul mercato, un solo linguaggio (TS) su tutto il progetto |
| **Backend** | Node.js + Express + TypeScript | Come richiesto, ottimo per imparare API REST, coerente con il resto dello stack |
| **Database** | PostgreSQL + Prisma ORM | Relazionale (utenti, workout, serie, esercizi, post social sono tutti collegati tra loro), Prisma è molto apprezzato dai recruiter perché type-safe |
| **Autenticazione** | JWT + bcrypt (custom) | Più educativo di Firebase Auth — si vede cosa succede "sotto il cofano" |
| **Storage immagini** | Cloudinary (tier gratuito) | Per foto progresso corporeo e foto post-workout |
| **Sito web portfolio** | Next.js | SSR/SEO-friendly, ottimo per far vedere il progetto ai recruiter |
| **Database esercizi** | free-exercise-db (self-hosted) o WorkoutX API | Si vede confronto fatto in precedenza |
| **Deploy backend** | Railway o Render (tier gratuito) | Setup rapido, buono per demo |
| **Deploy sito** | Vercel | Gratuito, integrazione perfetta con Next.js |

## 2. Struttura del Repository (monorepo)

```
traktion/
├── apps/
│   ├── mobile/              # React Native (Expo) app
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── hooks/
│   │   │   ├── api/         # client per chiamare il backend
│   │   │   └── store/       # gestione stato (Zustand consigliato)
│   │   └── app.json
│   │
│   ├── backend/              # Node.js + Express API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── prisma/
│   │   │       └── schema.prisma
│   │   └── package.json
│   │
│   └── website/               # Next.js — sito portfolio del progetto
│       ├── app/
│       └── public/
│
├── packages/
│   └── shared-types/          # tipi TypeScript condivisi tra mobile e backend
│
└── README.md
```

## 3. Modello Dati (entità principali)

- **User** — profilo, obiettivo calorico giornaliero
- **WorkoutPlan** — nome, lista esercizi collegati
- **PlanExercise** — esercizio + numero serie target + tempo di riposo scelto
- **WorkoutSession** — istanza di un allenamento avviato (data, durata)
- **SetLog** — peso, reps, serie numero, completata (bool), collegata a SessionExercise
- **Exercise** — nome, gruppo muscolare, attrezzatura, immagine/GIF (dal database esterno)
- **PersonalRecord** — esercizio, peso, reps, data (calcolato automaticamente da SetLog)
- **FoodEntry** — pasto (colazione/spuntino/pranzo/cena), descrizione, macro calcolati, data
- **WorkoutPost** — (opzionale/social) volume totale, PR ottenuti, durata, foto, collegato a WorkoutSession
- **Follow** — relazione tra due User (per la parte social)

## 4. Roadmap a Fasi

### Fase 0 — Setup 
- Inizializzare monorepo, Expo app, backend Express, schema Prisma
- Configurare design system (blu/nero, stile Gymshark) con la skill UI UX Pro Max
- Autenticazione base (registrazione/login)

### Fase 1 — Workout Tracker MVP
- Workout builder (crea piano, nome, aggiungi esercizi da database esterno)
- Avvio sessione allenamento
- Input peso/reps per serie + tick di completamento
- Timer di riposo configurabile per esercizio, con vibrazione/notifica agli ultimi 5 secondi
- Vista "ultima volta hai fatto X kg / Y reps" durante l'inserimento

### Fase 2 — Progressi e Motivazione
- Grafico progresso per esercizio (peso nel tempo + volume totale)
- Rilevamento automatico PR + riepilogo a fine allenamento
- Streak di allenamenti consecutivi

### Fase 3 — Food Tracking
- Inserimento pasto per categoria (colazione/spuntino/pranzo/cena)
- Calcolo macro (via API nutrizionale o stima AI)
- Obiettivo calorico giornaliero + calorie rimanenti
- Quick log (pasti salvati/preferiti)

### Fase 4 — Social 
- Post automatico a fine allenamento (volume, PR, durata, foto)
- Feed scrollabile, follow tra utenti
- Reazioni rapide

### Fase 5 — Rifinitura e Portfolio
- Polish UI/UX completo
- Sito web Next.js con demo, screenshot, spiegazione tecnica
- Deploy pubblico (backend + sito) per mostrarlo nei colloqui

### Importante
3. Installare la skill di design (`uipro init --ai claude`)
4. Generare il design system blu/nero