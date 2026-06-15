import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink],

  templateUrl: './maintenance.component.html',
  styles: [`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');

:host {
    display: block;
}

/* ── Root ────────────────────────────────────────────────── */
.maintenance-root {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(
        135deg,
        #f4fffb 0%,
        #ecfdf5 50%,
        #d1fae5 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: 'DM Mono', monospace;
    color: #1f2937;
}

/* ── Floating Medical Particles ──────────────────────────── */
.stars-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.star {
    position: absolute;
    background: #10b981;
    border-radius: 50%;
    opacity: 0;
    animation: twinkle linear infinite;
}

@keyframes twinkle {
    0%,100% {
        opacity: 0;
        transform: scale(1);
    }
    50% {
        opacity: .7;
        transform: scale(1.4);
    }
}

/* ── Ambient Mint Orbs ───────────────────────────────────── */
.orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    animation: drift 18s ease-in-out infinite alternate;
}

.orb-1 {
    width: 500px;
    height: 500px;
    background: rgba(52, 211, 153, 0.18);
    top: -150px;
    left: -120px;
}

.orb-2 {
    width: 400px;
    height: 400px;
    background: rgba(16, 185, 129, 0.15);
    bottom: -100px;
    right: -80px;
    animation-duration: 24s;
}

.orb-3 {
    width: 260px;
    height: 260px;
    background: rgba(110, 231, 183, 0.18);
    top: 40%;
    left: 55%;
    animation-duration: 28s;
}

@keyframes drift {
    from {
        transform: translate(0, 0) scale(1);
    }
    to {
        transform: translate(40px, 30px) scale(1.08);
    }
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
    max-width: 680px;
    width: 100%;
    animation: fadeUp .9s cubic-bezier(.22,1,.36,1) both;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(32px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ── Glass Card ──────────────────────────────────────────── */
.content-wrapper::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 28px;
    background: rgba(255,255,255,.75);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(16,185,129,.12);
    box-shadow:
        0 20px 60px rgba(16,185,129,.08),
        0 8px 24px rgba(0,0,0,.04);
    z-index: -1;
}

/* ── Gear Cluster ────────────────────────────────────────── */
.gear-cluster {
    position: relative;
    width: 110px;
    height: 110px;
    margin-bottom: 2rem;
}

.gear {
    position: absolute;
    color: #10b981;
}

.gear-large {
    width: 90px;
    height: 90px;
    top: 0;
    left: 0;
    animation: spin-cw 8s linear infinite;
    filter: drop-shadow(0 0 15px rgba(16,185,129,.35));
}

.gear-small {
    width: 48px;
    height: 48px;
    bottom: 0;
    right: 0;
    color: #34d399;
    animation: spin-ccw 5s linear infinite;
}

@keyframes spin-cw {
    to {
        transform: rotate(360deg);
    }
}

@keyframes spin-ccw {
    to {
        transform: rotate(-360deg);
    }
}

/* ── Badge ──────────────────────────────────────────────── */
.badge {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    padding: .45rem 1rem;
    border-radius: 999px;
    background: rgba(16,185,129,.08);
    border: 1px solid rgba(16,185,129,.15);
    color: #059669;
    font-size: .72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .12em;
    margin-bottom: 1.8rem;
}

.badge-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse-dot 1.8s ease-in-out infinite;
}

@keyframes pulse-dot {
    0%,100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.5);
    }
}

/* ── Headline ───────────────────────────────────────────── */
.headline {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(3rem, 10vw, 5rem);
    line-height: 1;
    margin: 0 0 1.5rem;
}

.headline-line {
    display: block;
}

.accent {
    background: linear-gradient(
        135deg,
        #10b981,
        #34d399
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* ── Subtext ────────────────────────────────────────────── */
.subtext {
    font-size: .95rem;
    line-height: 1.8;
    color: #6b7280;
    max-width: 500px;
    margin-bottom: 2.5rem;
}

/* ── Progress ───────────────────────────────────────────── */
.progress-container {
    width: 100%;
    max-width: 450px;
    margin-bottom: 2.5rem;
}

.progress-labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: .5rem;
    font-size: .72rem;
    color: #6b7280;
    text-transform: uppercase;
}

.progress-pct {
    color: #059669;
    font-weight: 700;
}

.progress-track {
    width: 100%;
    height: 8px;
    background: rgba(16,185,129,.12);
    border-radius: 999px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(
        90deg,
        #10b981,
        #34d399
    );
    border-radius: 999px;
    box-shadow: 0 0 12px rgba(16,185,129,.35);
}

/* ── Countdown ──────────────────────────────────────────── */
.countdown-grid {
    display: flex;
    gap: 1rem;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.countdown-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 1.2rem;
    min-width: 80px;
    border-radius: 16px;
    background: rgba(255,255,255,.8);
    border: 1px solid rgba(16,185,129,.12);
    box-shadow: 0 8px 24px rgba(16,185,129,.06);
}

.countdown-cell:hover {
    transform: translateY(-2px);
}

.countdown-value {
    font-family: 'Syne', sans-serif;
    font-size: 1.8rem;
    font-weight: 800;
    color: #059669;
}

.countdown-label {
    font-size: .7rem;
    letter-spacing: .1em;
    color: #6b7280;
    text-transform: uppercase;
}

/* ── Notify Section ─────────────────────────────────────── */
.notify-strip {
    display: flex;
    gap: .75rem;
    width: 100%;
    max-width: 450px;
    margin-bottom: 1.75rem;
}

.notify-input {
    flex: 1;
    padding: .85rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(16,185,129,.15);
    background: rgba(255,255,255,.9);
    color: #1f2937;
    outline: none;
}

.notify-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16,185,129,.12);
}

.notify-input::placeholder {
    color: #9ca3af;
}

.notify-btn {
    padding: .85rem 1.5rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    color: white;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    background: linear-gradient(
        135deg,
        #10b981,
        #34d399
    );
    box-shadow: 0 8px 24px rgba(16,185,129,.25);
    transition: all .25s ease;
}

.notify-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(16,185,129,.35);
}

/* ── Social ─────────────────────────────────────────────── */
.social-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: .8rem;
}

.social-label {
    color: #6b7280;
}

.social-link {
    color: #059669;
    text-decoration: none;
    font-weight: 600;
    transition: .2s;
}

.social-link:hover {
    color: #10b981;
}
    `]
})
export class Maintenance implements OnInit, OnDestroy {

  stars: { x: number; y: number; size: number; delay: string; duration: string }[] = [];

  progressValue = 0;
  countdown = [
    { label: 'Hours', value: '00' },
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
          { label: 'Hours', value: '00' },
          { label: 'Minutes', value: '00' },
          { label: 'Seconds', value: '00' },
        ];
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      this.countdown = [
        { label: 'Hours', value: String(h).padStart(2, '0') },
        { label: 'Minutes', value: String(m).padStart(2, '0') },
        { label: 'Seconds', value: String(s).padStart(2, '0') },
      ];
    };
    update();
    this.timerInterval = setInterval(update, 1000);
  }
}