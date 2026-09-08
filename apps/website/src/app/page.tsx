import styles from "./page.module.css";

const GITHUB_URL = "https://github.com/besnikajdini/Traktion";

const PHASES = [
  {
    phase: "Fase 1",
    title: "Workout Tracker",
    items: [
      "Custom workout builder with an external exercise database",
      "Live session logging — weight, reps, one tap per set",
      "Configurable rest timer with haptic feedback",
      "“Last time you did X kg / Y reps” hints while logging",
    ],
  },
  {
    phase: "Fase 2",
    title: "Progress & Motivation",
    items: [
      "Automatic personal-record detection (max weight & max volume)",
      "End-of-session summary — duration, volume, PRs earned",
      "Per-exercise progress charts",
      "Weekly workout streaks",
    ],
  },
  {
    phase: "Fase 3",
    title: "Food Tracking",
    items: [
      "Free-text meal logging (“150g chicken breast and a portion of rice”)",
      "Local macro estimation — no paid API, no network call",
      "Favorite meals for one-tap re-logging",
      "Daily calories-remaining overview against a personal goal",
    ],
  },
  {
    phase: "Fase 4",
    title: "Social",
    items: [
      "Share a finished workout — opt-in, off by default",
      "Follow other users and browse public profiles",
      "A following feed, paginated",
      "Quick reactions with a fixed set of emoji",
    ],
  },
  {
    phase: "Fase 5",
    title: "Polish & Ship",
    items: [
      "Consistent visual system across every screen",
      "Visible error states and loading feedback everywhere",
      "This site, and a public deploy of the backend and website",
    ],
  },
];

const STACK = [
  { layer: "Mobile app", tech: "React Native + Expo + TypeScript" },
  { layer: "Backend", tech: "Node.js + Express + TypeScript" },
  { layer: "Database", tech: "PostgreSQL + Prisma ORM" },
  { layer: "Auth", tech: "JWT + bcrypt, built from scratch" },
  { layer: "Image storage", tech: "Cloudinary" },
  { layer: "Website", tech: "Next.js (this site)" },
  { layer: "Backend deploy", tech: "Railway / Render" },
  { layer: "Website deploy", tech: "Vercel" },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <span className={styles.navLogo}>TRAKTION</span>
        <a className={styles.navLink} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
      </header>

      <main>
        {/* ---- Hero ---- */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Portfolio project — built solo, end to end</p>
            <h1 className={styles.h1}>Log your lifts. Track your macros. Share it if you want to.</h1>
            <p className={styles.lead}>
              Traktion is a full-stack fitness app: a workout tracker with automatic PR detection, a food log that
              estimates macros from what you actually typed, and an entirely opt-in social layer — no data shared
              without an explicit tap.
            </p>
            <div className={styles.ctaRow}>
              <a className={styles.ctaPrimary} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                View the code on GitHub
              </a>
              <a
                className={styles.ctaSecondary}
                href={`${GITHUB_URL}/blob/main/DEVELOPMENT_LOG.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the build log
              </a>
            </div>
          </div>

          <PhonePreview />
        </section>

        {/* ---- Features by phase ---- */}
        <section className={styles.section} id="features">
          <h2 className={styles.h2}>What&apos;s built</h2>
          <p className={styles.sectionLead}>Five phases, shipped in order, each documented as it was built.</p>

          <div className={styles.phaseGrid}>
            {PHASES.map((p) => (
              <div key={p.phase} className={styles.phaseCard}>
                <span className={styles.phaseTag}>{p.phase}</span>
                <h3 className={styles.phaseTitle}>{p.title}</h3>
                <ul className={styles.phaseList}>
                  {p.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Tech stack ---- */}
        <section className={styles.section} id="stack">
          <h2 className={styles.h2}>Tech stack</h2>
          <p className={styles.sectionLead}>One TypeScript codebase across the whole product, mobile to backend.</p>

          <div className={styles.stackGrid}>
            {STACK.map((s) => (
              <div key={s.layer} className={styles.stackRow}>
                <span className={styles.stackLayer}>{s.layer}</span>
                <span className={styles.stackTech}>{s.tech}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- CTA ---- */}
        <section className={styles.closingSection}>
          <h2 className={styles.h2}>Curious how it&apos;s built?</h2>
          <p className={styles.sectionLead}>
            Every phase is written up in the repo&apos;s development log — including the dead ends, like the
            nutrition API that turned out to need a paid plan after it was already integrated.
          </p>
          <a className={styles.ctaPrimary} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            github.com/besnikajdini/Traktion
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Built by Besnik Ajdini</span>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  );
}

// A CSS-built recreation of the app's home screen — not a literal
// screenshot (none were taken this session, see DEVELOPMENT_LOG.md), but
// styled with the exact same tokens as apps/mobile/src/theme so it's an
// honest preview of the real look.
function PhonePreview() {
  return (
    <div className={styles.phone}>
      <div className={styles.phoneScreen}>
        <p className={styles.phoneGreeting}>Hi, Alex</p>

        <div className={styles.phoneStreakCard}>
          <span className={styles.phoneStreakNumber}>7</span>
          <span className={styles.phoneStreakLabel}>weeks streak</span>
        </div>

        <div className={styles.phoneStatRow}>
          <div className={styles.phoneStatCard}>
            <span className={styles.phoneStatValue}>4 820 kg</span>
            <span className={styles.phoneStatLabel}>Volume</span>
          </div>
          <div className={styles.phoneStatCard}>
            <span className={styles.phoneStatValue}>52m</span>
            <span className={styles.phoneStatLabel}>Duration</span>
          </div>
        </div>

        <div className={styles.phonePrBadge}>🏆 New PR — Bench Press 100kg × 5</div>
      </div>
    </div>
  );
}
