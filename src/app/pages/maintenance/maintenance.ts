import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-maintenance',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="maintenance-root">

      <!-- Starfield canvas -->
      <div class="stars-layer">
        <span *ngFor="let s of stars" class="star"
          [style.left.%]="s.x"
          [style.top.%]="s.y"
          [style.width.px]="s.size"
          [style.height.px]="s.size"
          [style.animationDelay]="s.delay"
          [style.animationDuration]="s.duration">
        </span>
      </div>

      <!-- Ambient orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <!-- Main content -->
      <div class="content-wrapper">

        <!-- Icon / gear cluster -->
        <div class="gear-cluster">
          <div class="gear gear-large">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.3 5.8l-3.1 9.4a35.5 35.5 0 00-8.5 3.5L22.5 14 14 22.5l4.7 9.2a35.5 35.5 0 00-3.5 8.5l-9.4 3.1v12l9.4 3.1c.8 3 2 5.9 3.5 8.5L14 77.5 22.5 86l9.2-4.7c2.6 1.5 5.5 2.7 8.5 3.5l3.1 9.4h12l3.1-9.4a35.5 35.5 0 008.5-3.5l9.2 4.7L86 77.5l-4.7-9.2c1.5-2.6 2.7-5.5 3.5-8.5l9.4-3.1v-12l-9.4-3.1a35.5 35.5 0 00-3.5-8.5L86 22.5 77.5 14l-9.2 4.7a35.5 35.5 0 00-8.5-3.5l-3.1-9.4h-12z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
              <circle cx="50" cy="50" r="15" stroke="currentColor" stroke-width="4"/>
            </svg>
          </div>
          <div class="gear gear-small">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.3 5.8l-3.1 9.4a35.5 35.5 0 00-8.5 3.5L22.5 14 14 22.5l4.7 9.2a35.5 35.5 0 00-3.5 8.5l-9.4 3.1v12l9.4 3.1c.8 3 2 5.9 3.5 8.5L14 77.5 22.5 86l9.2-4.7c2.6 1.5 5.5 2.7 8.5 3.5l3.1 9.4h12l3.1-9.4a35.5 35.5 0 008.5-3.5l9.2 4.7L86 77.5l-4.7-9.2c1.5-2.6 2.7-5.5 3.5-8.5l9.4-3.1v-12l-9.4-3.1a35.5 35.5 0 00-3.5-8.5L86 22.5 77.5 14l-9.2 4.7a35.5 35.5 0 00-8.5-3.5l-3.1-9.4h-12z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
              <circle cx="50" cy="50" r="15" stroke="currentColor" stroke-width="4"/>
            </svg>
          </div>
        </div>

        <!-- Badge -->
        <div class="badge">
          <span class="badge-dot"></span>
          <span>System Update in Progress</span>
        </div>

        <!-- Headline -->
        <h1 class="headline">
          <span class="headline-line">Under</span>
          <span class="headline-line accent">Maintenance</span>
        </h1>

        <!-- Subtext -->
        <p class="subtext">
          We're polishing every pixel and tuning every system.<br>
          Something extraordinary is on its way.
        </p>

        <!-- Progress bar -->
        <div class="progress-container">
          <div class="progress-labels">
            <span>Progress</span>
            <span class="progress-pct">{{ progressValue }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="progressValue"></div>
          </div>
        </div>

        <!-- Countdown -->
        <div class="countdown-grid">
          <div class="countdown-cell" *ngFor="let unit of countdown">
            <div class="countdown-value">{{ unit.value }}</div>
            <div class="countdown-label">{{ unit.label }}</div>
          </div>
        </div>

        <!-- Notify strip -->
        <!-- <div class="notify-strip">
          <input type="email" class="notify-input" placeholder="your@email.com" />
          <button class="notify-btn">Notify Me</button>
        </div> -->

        <!-- Social links -->
        <div class="social-row">
          <span class="social-label">Stay updated →</span>
          <a href="https://www.facebook.com/peedodavnorofficial" class="social-link">Facebook</a>
          <!-- <a href="#" class="social-link">Discord</a>
          <a href="#" class="social-link">GitHub</a> -->
        </div>

      </div>
    </div>
    `,
    styles: [`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400&display=swap');

      :host { display: block; }

      /* ── Root ────────────────────────────────────────────────── */
      .maintenance-root {
        position: relative;
        min-height: 100vh;
        background: #04040f;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        font-family: 'DM Mono', monospace;
        color: #e2e0ff;
      }

      /* ── Stars ───────────────────────────────────────────────── */
      .stars-layer { position: absolute; inset: 0; pointer-events: none; }
      .star {
        position: absolute;
        background: white;
        border-radius: 50%;
        opacity: 0;
        animation: twinkle linear infinite;
      }
      @keyframes twinkle {
        0%, 100% { opacity: 0; transform: scale(1); }
        50%       { opacity: 0.85; transform: scale(1.3); }
      }

      /* ── Ambient orbs ────────────────────────────────────────── */
      .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(90px);
        pointer-events: none;
        animation: drift 18s ease-in-out infinite alternate;
      }
      .orb-1 { width: 480px; height: 480px; background: #3b1fff33; top: -120px; left: -80px; animation-duration: 18s; }
      .orb-2 { width: 360px; height: 360px; background: #8b5cf622; bottom: -80px; right: -60px; animation-duration: 22s; animation-delay: -6s; }
      .orb-3 { width: 260px; height: 260px; background: #06b6d411; top: 40%; left: 55%; animation-duration: 26s; animation-delay: -12s; }

      @keyframes drift {
        from { transform: translate(0, 0) scale(1); }
        to   { transform: translate(40px, 30px) scale(1.08); }
      }

      /* ── Content ─────────────────────────────────────────────── */
      .content-wrapper {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 3rem 1.5rem;
        max-width: 640px;
        width: 100%;
        animation: fadeUp .9s cubic-bezier(.22,1,.36,1) both;
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(32px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ── Gear cluster ────────────────────────────────────────── */
      .gear-cluster {
        position: relative;
        width: 110px;
        height: 110px;
        margin-bottom: 2.5rem;
      }
      .gear { position: absolute; color: #7c6fff; }
      .gear-large {
        width: 90px; height: 90px;
        top: 0; left: 0;
        animation: spin-cw 8s linear infinite;
        filter: drop-shadow(0 0 10px #7c6fff88);
      }
      .gear-small {
        width: 48px; height: 48px;
        bottom: 0; right: 0;
        animation: spin-ccw 5s linear infinite;
        color: #38bdf8;
        filter: drop-shadow(0 0 8px #38bdf888);
      }
      @keyframes spin-cw  { to { transform: rotate(360deg); } }
      @keyframes spin-ccw { to { transform: rotate(-360deg); } }

      /* ── Badge ───────────────────────────────────────────────── */
      .badge {
        display: inline-flex;
        align-items: center;
        gap: .5rem;
        padding: .35rem 1rem;
        border-radius: 999px;
        border: 1px solid #7c6fff44;
        background: #7c6fff11;
        font-size: .7rem;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: #a89fff;
        margin-bottom: 1.8rem;
        animation: fadeUp .9s .15s cubic-bezier(.22,1,.36,1) both;
      }
      .badge-dot {
        width: 7px; height: 7px;
        background: #7c6fff;
        border-radius: 50%;
        box-shadow: 0 0 8px #7c6fffaa;
        animation: pulse-dot 1.8s ease-in-out infinite;
      }
      @keyframes pulse-dot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50%       { transform: scale(1.5); opacity: .6; }
      }

      /* ── Headline ────────────────────────────────────────────── */
      .headline {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: clamp(3rem, 10vw, 5.5rem);
        line-height: 1;
        letter-spacing: -.02em;
        display: flex;
        flex-direction: column;
        margin: 0 0 1.5rem;
        animation: fadeUp .9s .25s cubic-bezier(.22,1,.36,1) both;
      }
      .headline-line { display: block; }
      .accent {
        background: linear-gradient(135deg, #7c6fff 0%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 30px #7c6fff66);
      }

      /* ── Subtext ─────────────────────────────────────────────── */
      .subtext {
        font-size: .9rem;
        line-height: 1.75;
        color: #9896b8;
        max-width: 420px;
        margin: 0 0 2.5rem;
        animation: fadeUp .9s .35s cubic-bezier(.22,1,.36,1) both;
      }

      /* ── Progress ────────────────────────────────────────────── */
      .progress-container {
        width: 100%;
        max-width: 420px;
        margin-bottom: 2.5rem;
        animation: fadeUp .9s .45s cubic-bezier(.22,1,.36,1) both;
      }
      .progress-labels {
        display: flex;
        justify-content: space-between;
        font-size: .72rem;
        color: #6662a8;
        margin-bottom: .5rem;
        text-transform: uppercase;
        letter-spacing: .08em;
      }
      .progress-pct { color: #a89fff; }
      .progress-track {
        width: 100%;
        height: 5px;
        background: #ffffff0f;
        border-radius: 999px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #7c6fff, #38bdf8);
        border-radius: 999px;
        transition: width 1s cubic-bezier(.22,1,.36,1);
        box-shadow: 0 0 12px #7c6fff88;
        position: relative;
      }
      .progress-fill::after {
        content: '';
        position: absolute;
        right: 0; top: 0; bottom: 0;
        width: 20px;
        background: white;
        opacity: .4;
        border-radius: 999px;
        animation: shimmer 1.5s ease-in-out infinite;
      }
      @keyframes shimmer {
        0%, 100% { opacity: .4; }
        50%       { opacity: 1; }
      }

      /* ── Countdown ───────────────────────────────────────────── */
      .countdown-grid {
        display: flex;
        gap: 1rem;
        margin-bottom: 2.5rem;
        animation: fadeUp .9s .55s cubic-bezier(.22,1,.36,1) both;
      }
      .countdown-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .3rem;
        padding: 1rem 1.25rem;
        border-radius: 12px;
        background: #ffffff06;
        border: 1px solid #ffffff0d;
        backdrop-filter: blur(8px);
        min-width: 72px;
        transition: border-color .3s;
      }
      .countdown-cell:hover { border-color: #7c6fff44; }
      .countdown-value {
        font-family: 'Syne', sans-serif;
        font-size: 1.8rem;
        font-weight: 700;
        color: #e2e0ff;
        line-height: 1;
      }
      .countdown-label {
        font-size: .65rem;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: #6662a8;
      }

      /* ── Notify ──────────────────────────────────────────────── */
      .notify-strip {
        display: flex;
        gap: .75rem;
        width: 100%;
        max-width: 420px;
        margin-bottom: 1.75rem;
        animation: fadeUp .9s .65s cubic-bezier(.22,1,.36,1) both;
      }
      .notify-input {
        flex: 1;
        background: #ffffff08;
        border: 1px solid #ffffff12;
        border-radius: 10px;
        padding: .75rem 1rem;
        color: #e2e0ff;
        font-family: 'DM Mono', monospace;
        font-size: .85rem;
        outline: none;
        transition: border-color .25s, box-shadow .25s;
      }
      .notify-input:focus {
        border-color: #7c6fff66;
        box-shadow: 0 0 0 3px #7c6fff1a;
      }
      .notify-input::placeholder { color: #555388; }
      .notify-btn {
        padding: .75rem 1.5rem;
        border-radius: 10px;
        background: linear-gradient(135deg, #7c6fff, #5b4de8);
        color: white;
        font-family: 'Syne', sans-serif;
        font-weight: 700;
        font-size: .85rem;
        border: none;
        cursor: pointer;
        white-space: nowrap;
        letter-spacing: .04em;
        transition: opacity .2s, transform .15s, box-shadow .2s;
        box-shadow: 0 4px 20px #7c6fff44;
      }
      .notify-btn:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 8px 28px #7c6fff66; }
      .notify-btn:active { transform: translateY(0); }

      /* ── Social ──────────────────────────────────────────────── */
      .social-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: .78rem;
        animation: fadeUp .9s .75s cubic-bezier(.22,1,.36,1) both;
      }
      .social-label { color: #5550a0; }
      .social-link {
        color: #9896b8;
        text-decoration: none;
        letter-spacing: .06em;
        transition: color .2s;
      }
      .social-link:hover { color: #a89fff; }
    `]
})
export class Maintenance implements OnInit, OnDestroy {

  stars: { x: number; y: number; size: number; delay: string; duration: string }[] = [];

  progressValue = 0;
  countdown = [
    { label: 'Hours',   value: '00' },
    { label: 'Minutes', value: '00' },
    { label: 'Seconds', value: '00' },
  ];

  private targetDate = new Date(Date.now() + 70 * 60 * 60 * 1000 + 23 * 60 * 1000 + 47 * 1000);
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.generateStars();
    this.animateProgress();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.progressInterval) clearInterval(this.progressInterval);
  }

  generateStars(): void {
    this.stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: `${(Math.random() * 6).toFixed(2)}s`,
      duration: `${(Math.random() * 4 + 3).toFixed(2)}s`,
    }));
  }

  animateProgress(): void {
    const target = 73;
    let current = 0;
    this.progressInterval = setInterval(() => {
      current += 1;
      this.progressValue = current;
      if (current >= target && this.progressInterval) {
        clearInterval(this.progressInterval);
      }
    }, 18);
  }

  startCountdown(): void {
    const update = () => {
      const diff = this.targetDate.getTime() - Date.now();
      if (diff <= 0) {
        this.countdown = [
          { label: 'Hours',   value: '00' },
          { label: 'Minutes', value: '00' },
          { label: 'Seconds', value: '00' },
        ];
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      this.countdown = [
        { label: 'Hours',   value: String(h).padStart(2, '0') },
        { label: 'Minutes', value: String(m).padStart(2, '0') },
        { label: 'Seconds', value: String(s).padStart(2, '0') },
      ];
    };
    update();
    this.timerInterval = setInterval(update, 1000);
  }
}