/**
 * İNSAN MI, YAPAY ZEKÂ MI? - 3D ÇOCUK OYUNU MOTORU (6 YAŞ ÖZEL)
 * Özellikler: Web Audio Sentezleyici, Sesli Okuma, 3D İnteraktif Kart Eğimi,
 * Konfeti Patlaması, Zengin Vektör Çizimler, Dokunmatik & Sürükleme Desteği.
 */

// ==========================================================================
// 1. SES EFEKTLERİ SENTEZLEYİCİSİ (Web Audio API - Sıfır Bağımlılık)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    // Neşeli 4 Notalı Arpej (C5, E5, G5, C6) - Glockenspiel Tınısı
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.3, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.36);
    });
  }

  playTryAgain() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    // Sevimli yay sesi (Boing)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.28);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const now = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      const start = now + i * 0.12;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.35, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  }
}

const sfx = new SoundFX();

// ==========================================================================
// 2. RENKLİ KONFETİ PATLAMASI SİSTEMİ (Canvas)
// ==========================================================================
class ConfettiSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  burst(x, y, count = 45) {
    const colors = ["#ff6b6b", "#feca57", "#1dd1a1", "#54a0ff", "#5f27cd", "#ff9ff3", "#00d2d3"];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 6;
      this.particles.push({
        x: x || this.width / 2,
        y: y || this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 16,
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        isStar: Math.random() > 0.6
      });
    }
    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Yerçekimi
      p.vx *= 0.98;
      p.rotation += p.vRot;
      p.life -= p.decay;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;

      if (p.isStar) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      }
      this.ctx.restore();

      if (p.life <= 0 || p.y > this.height) {
        this.particles.splice(idx, 1);
      }
    });

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

const confetti = new ConfettiSystem("confettiCanvas");

// ==========================================================================
// 3. 6 YAŞ İÇİN 3D CANLI VEGLER / İLLÜSTRASYONLAR (16 ÖZELLİK)
// ==========================================================================
const SVG_ARTS = {
  // 1. Yemek Yemek
  yemek: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="melonRed" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ff6b6b"/>
          <stop offset="100%" stop-color="#ee5253"/>
        </radialGradient>
        <linearGradient id="rindGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#10ac84"/>
          <stop offset="100%" stop-color="#1dd1a1"/>
        </linearGradient>
        <radialGradient id="appleGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#ff7675"/>
          <stop offset="100%" stop-color="#d63031"/>
        </radialGradient>
      </defs>
      <!-- Sulu Karpuz Dilimi -->
      <g transform="translate(40, 20)">
        <path d="M 10 120 A 70 70 0 0 0 150 120 Z" fill="url(#rindGrad)"/>
        <path d="M 16 114 A 64 64 0 0 0 144 114 Z" fill="#ffffff"/>
        <path d="M 22 108 A 58 58 0 0 0 138 108 Z" fill="url(#melonRed)"/>
        <!-- Karpuz Çekirdekleri -->
        <ellipse cx="50" cy="85" rx="3" ry="5" fill="#2d3436" transform="rotate(-15 50 85)"/>
        <ellipse cx="80" cy="72" rx="3" ry="5" fill="#2d3436"/>
        <ellipse cx="110" cy="85" rx="3" ry="5" fill="#2d3436" transform="rotate(15 110 85)"/>
        <ellipse cx="80" cy="98" rx="3" ry="5" fill="#2d3436"/>
      </g>
      <!-- Yanında Parlak Elma -->
      <g transform="translate(145, 75)">
        <circle cx="28" cy="28" r="26" fill="url(#appleGrad)"/>
        <path d="M 28 4 Q 35 -6 42 -2" fill="none" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="38" cy="3" rx="7" ry="4" fill="#2ed573" transform="rotate(-20 38 3)"/>
        <circle cx="20" cy="20" r="6" fill="#fff" opacity="0.4"/>
      </g>
      <!-- Parıltılar -->
      <text x="30" y="45" font-size="22">✨</text>
      <text x="185" y="55" font-size="20">🍉</text>
    </svg>
  `,

  // 2. Soruları Yanıtlamak
  sorular: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bulbGlow" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fff275"/>
          <stop offset="60%" stop-color="#feca57"/>
          <stop offset="100%" stop-color="#ff9f43"/>
        </radialGradient>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#e8f4f8"/>
        </linearGradient>
      </defs>
      <!-- Düşünce & Soru Balonu -->
      <rect x="25" y="25" width="105" height="75" rx="24" fill="url(#cloudGrad)" stroke="#54a0ff" stroke-width="4"/>
      <polygon points="65,100 80,100 70,118" fill="#54a0ff"/>
      <text x="50" y="78" font-size="52" font-weight="900" fill="#54a0ff">?</text>
      <text x="90" y="60" font-size="28" font-weight="900" fill="#ff6b6b">?</text>
      
      <!-- Fikir Ampulü (3D Parlayan) -->
      <g transform="translate(130, 30)">
        <circle cx="45" cy="45" r="40" fill="url(#bulbGlow)"/>
        <rect x="33" y="80" width="24" height="16" rx="4" fill="#bdc3c7"/>
        <rect x="37" y="96" width="16" height="8" rx="3" fill="#7f8c8d"/>
        <!-- Işık Hüzmeleri -->
        <line x1="45" y1="-2" x2="45" y2="-12" stroke="#feca57" stroke-width="5" stroke-linecap="round"/>
        <line x1="92" y1="20" x2="102" y2="14" stroke="#feca57" stroke-width="5" stroke-linecap="round"/>
        <line x1="95" y1="65" x2="106" y2="72" stroke="#feca57" stroke-width="5" stroke-linecap="round"/>
        <circle cx="34" cy="34" r="8" fill="#fff" opacity="0.6"/>
        <text x="32" y="58" font-size="28">💡</text>
      </g>
    </svg>
  `,

  // 3. Uyumak
  uyumak: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nightSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2c3e50"/>
          <stop offset="100%" stop-color="#34495e"/>
        </linearGradient>
        <radialGradient id="moonGlow" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fff3b0"/>
          <stop offset="100%" stop-color="#feca57"/>
        </radialGradient>
      </defs>
      <!-- Hilal Ay -->
      <path d="M 65 30 A 45 45 0 1 0 115 110 A 38 38 0 1 1 65 30 Z" fill="url(#moonGlow)"/>
      <ellipse cx="65" cy="62" rx="4" ry="7" fill="#f39c12" opacity="0.4"/>
      <!-- Yumuşak Pofuduk Yastık -->
      <g transform="translate(85, 80)">
        <rect x="0" y="10" width="120" height="55" rx="24" fill="#ffffff" stroke="#c8d6e5" stroke-width="3"/>
        <path d="M 15 38 Q 60 48 105 38" fill="none" stroke="#dfe6e9" stroke-width="3"/>
        <!-- Sevimli Uyuyan Ayıcık Kafası -->
        <circle cx="60" cy="18" r="28" fill="#b07d62"/>
        <circle cx="40" cy="-2" r="10" fill="#b07d62"/>
        <circle cx="80" cy="-2" r="10" fill="#b07d62"/>
        <ellipse cx="60" cy="24" rx="14" ry="10" fill="#eed9c4"/>
        <ellipse cx="60" cy="20" rx="5" ry="3" fill="#4a2810"/>
        <!-- Kapalı Gözler -->
        <path d="M 49 14 Q 54 18 57 14" fill="none" stroke="#4a2810" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 63 14 Q 66 18 71 14" fill="none" stroke="#4a2810" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <!-- Zzz Harfleri -->
      <text x="145" y="55" font-size="22" font-weight="900" fill="#54a0ff">Z</text>
      <text x="168" y="40" font-size="28" font-weight="900" fill="#54a0ff">Z</text>
      <text x="195" y="24" font-size="34" font-weight="900" fill="#5f27cd">z</text>
    </svg>
  `,

  // 4. Yol Tarif Etmek
  yol: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mapGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f5f6fa"/>
          <stop offset="100%" stop-color="#dcdde1"/>
        </linearGradient>
        <radialGradient id="pinGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#ff6b6b"/>
          <stop offset="100%" stop-color="#ee5253"/>
        </radialGradient>
      </defs>
      <!-- 3D Katlanmış Harita -->
      <g transform="translate(30, 30)">
        <polygon points="0,20 60,0 120,20 180,0 180,95 120,115 60,95 0,115" fill="url(#mapGrad)" stroke="#718093" stroke-width="3"/>
        <line x1="60" y1="0" x2="60" y2="95" stroke="#718093" stroke-width="2" stroke-dasharray="4,3"/>
        <line x1="120" y1="20" x2="120" y2="115" stroke="#718093" stroke-width="2" stroke-dasharray="4,3"/>
        <!-- Kıvrılan GPS Yolu -->
        <path d="M 25 80 C 45 40, 85 90, 140 45" fill="none" stroke="#3498db" stroke-width="7" stroke-linecap="round"/>
        <path d="M 25 80 C 45 40, 85 90, 140 45" fill="none" stroke="#2980b9" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,5"/>
      </g>
      <!-- Kırmızı 3D Konum İğnesi (Pin) -->
      <g transform="translate(155, 35)">
        <ellipse cx="18" cy="46" rx="14" ry="6" fill="#000" opacity="0.2"/>
        <path d="M 18 42 C 4 25, 0 16, 0 10 A 18 18 0 1 1 36 10 C 36 16, 32 25, 18 42 Z" fill="url(#pinGrad)"/>
        <circle cx="18" cy="11" r="7" fill="#ffffff"/>
      </g>
      <text x="35" y="45" font-size="26">🧭</text>
    </svg>
  `,

  // 5. Su İçmek
  su: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ecf0f1" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#dff9fb" stop-opacity="0.7"/>
        </linearGradient>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#48dbfb"/>
          <stop offset="100%" stop-color="#0abde3"/>
        </linearGradient>
      </defs>
      <!-- Bardak Arkası ve Su -->
      <g transform="translate(75, 25)">
        <polygon points="12,125 78,125 86,25 4,25" fill="url(#glassGrad)" stroke="#74b9ff" stroke-width="3.5" rx="8"/>
        <!-- Su Dolu Kısım -->
        <polygon points="15,120 75,120 81,55 9,55" fill="url(#waterGrad)"/>
        <ellipse cx="45" cy="55" rx="36" ry="7" fill="#a0e7e5"/>
        <!-- Pipet -->
        <line x1="20" y1="-8" x2="52" y2="110" stroke="#ff6b6b" stroke-width="7" stroke-linecap="round"/>
        <line x1="20" y1="-8" x2="52" y2="110" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-dasharray="8,8"/>
        <!-- Bardak Parlaması -->
        <line x1="16" y1="35" x2="22" y2="115" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
      </g>
      <!-- Taze Su Damlaları -->
      <g transform="translate(170, 70)">
        <path d="M 12 0 C 12 0, 0 16, 0 24 A 12 12 0 0 0 24 24 C 24 16, 12 0, 12 0 Z" fill="#0abde3"/>
        <circle cx="8" cy="22" r="3" fill="#ffffff" opacity="0.7"/>
      </g>
      <text x="35" y="85" font-size="28">💧</text>
    </svg>
  `,

  // 6. Hava Durumunu Söylemek
  hava: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fff275"/>
          <stop offset="100%" stop-color="#f39c12"/>
        </radialGradient>
        <linearGradient id="rainCloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#ced6e0"/>
        </linearGradient>
      </defs>
      <!-- Gülümseyen Güneş -->
      <g transform="translate(50, 20)">
        <circle cx="45" cy="45" r="36" fill="url(#sunGrad)"/>
        <!-- Işınlar -->
        <circle cx="45" cy="45" r="48" fill="none" stroke="#f1c40f" stroke-width="5" stroke-dasharray="10,14"/>
        <!-- Gözler ve Gülümseme -->
        <circle cx="36" cy="40" r="4" fill="#d35400"/>
        <circle cx="54" cy="40" r="4" fill="#d35400"/>
        <path d="M 38 52 Q 45 60 52 52" fill="none" stroke="#d35400" stroke-width="3" stroke-linecap="round"/>
      </g>
      <!-- Pofuduk Yağmur Bulutu -->
      <g transform="translate(85, 55)">
        <path d="M 25 45 A 22 22 0 0 1 65 30 A 28 28 0 0 1 115 35 A 20 20 0 0 1 125 55 A 18 18 0 0 1 115 70 L 25 70 A 18 18 0 0 1 25 45 Z" fill="url(#rainCloud)" stroke="#a4b0be" stroke-width="3"/>
        <!-- Yağmur Damlacıkları -->
        <line x1="38" y1="80" x2="32" y2="96" stroke="#3498db" stroke-width="4" stroke-linecap="round"/>
        <line x1="65" y1="80" x2="59" y2="96" stroke="#3498db" stroke-width="4" stroke-linecap="round"/>
        <line x1="92" y1="80" x2="86" y2="96" stroke="#3498db" stroke-width="4" stroke-linecap="round"/>
      </g>
      <!-- Gökkuşağı İpucu -->
      <path d="M 170 120 A 50 50 0 0 0 220 70" fill="none" stroke="#ff7675" stroke-width="5"/>
      <path d="M 175 120 A 45 45 0 0 0 220 75" fill="none" stroke="#feca57" stroke-width="5"/>
      <path d="M 180 120 A 40 40 0 0 0 220 80" fill="none" stroke="#54a0ff" stroke-width="5"/>
    </svg>
  `,

  // 7. Üzülmek
  uzulmek: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sadFaceGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffe3cf"/>
          <stop offset="100%" stop-color="#f8be98"/>
        </radialGradient>
      </defs>
      <!-- Duygusal Çocuk Yüzü -->
      <g transform="translate(65, 20)">
        <circle cx="55" cy="55" r="50" fill="url(#sadFaceGrad)" stroke="#e29b71" stroke-width="3"/>
        <!-- Saç -->
        <path d="M 12 35 C 25 15, 85 15, 98 35 C 80 25, 30 25, 12 35 Z" fill="#7a431d"/>
        <!-- Üzgün Kaşlar -->
        <path d="M 28 36 Q 40 32 46 38" fill="none" stroke="#5a2a0a" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M 82 36 Q 70 32 64 38" fill="none" stroke="#5a2a0a" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Yaşlı Gözler -->
        <ellipse cx="36" cy="50" rx="6" ry="8" fill="#2d3436"/>
        <circle cx="34" cy="47" r="2.5" fill="#fff"/>
        <ellipse cx="74" cy="50" rx="6" ry="8" fill="#2d3436"/>
        <circle cx="72" cy="47" r="2.5" fill="#fff"/>
        <!-- Parlayan Gözyaşı -->
        <path d="M 76 60 C 76 60, 71 72, 71 77 A 5 5 0 0 0 81 77 C 81 72, 76 60, 76 60 Z" fill="#54a0ff"/>
        <!-- Üzgün Bükük Ağız -->
        <path d="M 40 85 Q 55 72 70 85" fill="none" stroke="#682405" stroke-width="4" stroke-linecap="round"/>
      </g>
      <!-- Kırık / İyileşen Kalp Rozeti -->
      <g transform="translate(165, 45) scale(1.1)">
        <text font-size="34">🩹</text>
      </g>
      <text x="30" y="60" font-size="26">🥺</text>
    </svg>
  `,

  // 8. Çizime Yardım Etmek
  cizim: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="palGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffeaa7"/>
          <stop offset="100%" stop-color="#fdcb6e"/>
        </linearGradient>
      </defs>
      <!-- 3D Renkli Ressam Paleti -->
      <g transform="translate(35, 20)">
        <path d="M 30 70 C 15 20, 85 10, 120 40 C 150 70, 120 120, 75 115 C 55 110, 50 85, 30 70 Z" fill="url(#palGrad)" stroke="#e17055" stroke-width="3"/>
        <circle cx="75" cy="85" r="9" fill="#f8f9fa" stroke="#e17055" stroke-width="2"/>
        <!-- Boya Lekeleri -->
        <circle cx="50" cy="38" r="8" fill="#ff7675"/>
        <circle cx="80" cy="30" r="8" fill="#0984e3"/>
        <circle cx="110" cy="50" r="8" fill="#00b894"/>
        <circle cx="115" cy="80" r="8" fill="#6c5ce7"/>
      </g>
      <!-- Sihirli Fırça -->
      <g transform="translate(130, 20) rotate(25)">
        <rect x="0" y="30" width="12" height="75" rx="5" fill="#d63031"/>
        <rect x="-2" y="20" width="16" height="14" rx="3" fill="#bdc3c7"/>
        <path d="M -1 20 C -1 5, 13 5, 13 20 Z" fill="#0984e3"/>
      </g>
      <!-- Çıkan Sihirli Yıldızlar / Çizgiler -->
      <path d="M 120 120 Q 155 135 195 110" fill="none" stroke="#fd79a8" stroke-width="6" stroke-linecap="round"/>
      <text x="175" y="80" font-size="28">✨</text>
      <text x="195" y="145" font-size="24">🎨</text>
    </svg>
  `,

  // 9. Mutlu Olmak
  mutlu: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="happyFace" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffe3cf"/>
          <stop offset="100%" stop-color="#f8be98"/>
        </radialGradient>
      </defs>
      <!-- Kahkaha Atan Çocuk Yüzü -->
      <g transform="translate(50, 25)">
        <circle cx="55" cy="55" r="50" fill="url(#happyFace)" stroke="#e29b71" stroke-width="3"/>
        <!-- Saç -->
        <path d="M 10 40 C 25 10, 85 10, 100 40 C 80 20, 30 20, 10 40 Z" fill="#5a2a0a"/>
        <!-- Neşeyle Kısılan Gözler -->
        <path d="M 28 45 Q 38 35 48 45" fill="none" stroke="#2d3436" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M 62 45 Q 72 35 82 45" fill="none" stroke="#2d3436" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Pembe Yanaklar -->
        <ellipse cx="28" cy="56" rx="9" ry="5" fill="#ff7675" opacity="0.6"/>
        <ellipse cx="82" cy="56" rx="9" ry="5" fill="#ff7675" opacity="0.6"/>
        <!-- Kocaman Gülen Ağız -->
        <path d="M 32 62 Q 55 95 78 62 Z" fill="#d63031"/>
        <path d="M 40 64 Q 55 76 70 64" fill="#ffffff"/>
      </g>
      <!-- Uçan Renkli Balonlar -->
      <g transform="translate(155, 15)">
        <ellipse cx="20" cy="30" rx="18" ry="22" fill="#ff7675"/>
        <path d="M 20 52 L 20 85" stroke="#7f8c8d" stroke-width="2"/>
        <ellipse cx="45" cy="45" rx="16" ry="20" fill="#feca57"/>
        <path d="M 45 65 L 30 90" stroke="#7f8c8d" stroke-width="2"/>
      </g>
      <text x="25" y="45" font-size="28">🎈</text>
    </svg>
  `,

  // 10. Hatırlatma Yapmak
  hatirlat: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="clockGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f1f2f6"/>
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff9f43"/>
          <stop offset="100%" stop-color="#ee5253"/>
        </linearGradient>
      </defs>
      <!-- 3D Çalar Saat -->
      <g transform="translate(70, 25)">
        <!-- Üst Çanlar -->
        <ellipse cx="22" cy="20" rx="16" ry="12" fill="url(#bodyGrad)" transform="rotate(-30 22 20)"/>
        <ellipse cx="78" cy="20" rx="16" ry="12" fill="url(#bodyGrad)" transform="rotate(30 78 20)"/>
        <!-- Saat Gövdesi -->
        <circle cx="50" cy="65" r="48" fill="url(#bodyGrad)"/>
        <circle cx="50" cy="65" r="40" fill="url(#clockGrad)"/>
        <!-- Ayaklar -->
        <rect x="18" y="105" width="10" height="15" rx="3" fill="#576574" transform="rotate(25 18 105)"/>
        <rect x="72" y="105" width="10" height="15" rx="3" fill="#576574" transform="rotate(-25 72 105)"/>
        <!-- Akrep ve Yelkovan -->
        <circle cx="50" cy="65" r="4" fill="#2d3436"/>
        <line x1="50" y1="65" x2="50" y2="40" stroke="#2d3436" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="65" x2="68" y2="65" stroke="#ee5253" stroke-width="3" stroke-linecap="round"/>
        <!-- Titreşim Dalgaları -->
        <path d="M -2 15 Q -10 25 -2 35" fill="none" stroke="#feca57" stroke-width="4" stroke-linecap="round"/>
        <path d="M 102 15 Q 110 25 102 35" fill="none" stroke="#feca57" stroke-width="4" stroke-linecap="round"/>
      </g>
      <text x="175" y="70" font-size="34">🔔</text>
      <text x="35" y="70" font-size="28">⏰</text>
    </svg>
  `,

  // 11. Üşümek
  usumek: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coldFace" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#e8f4f8"/>
          <stop offset="100%" stop-color="#bfe3ed"/>
        </radialGradient>
      </defs>
      <!-- Kışlık Bereli ve Atkılı Üşüyen Çocuk -->
      <g transform="translate(60, 20)">
        <!-- Çocuk Yüzü -->
        <circle cx="55" cy="55" r="45" fill="url(#coldFace)" stroke="#74b9ff" stroke-width="3"/>
        <!-- Bere -->
        <path d="M 15 45 C 15 5, 95 5, 95 45 Z" fill="#ff7675"/>
        <rect x="12" y="38" width="86" height="15" rx="7" fill="#ffffff"/>
        <circle cx="55" cy="5" r="10" fill="#ffffff"/>
        <!-- Titreyen Gözler -->
        <circle cx="38" cy="55" r="5" fill="#2d3436"/>
        <circle cx="72" cy="55" r="5" fill="#2d3436"/>
        <!-- Kızarık Burun -->
        <circle cx="55" cy="62" r="5" fill="#ff7675"/>
        <!-- Titreyen Dişler / Ağız -->
        <rect x="42" y="72" width="26" height="8" rx="3" fill="#ffffff" stroke="#74b9ff" stroke-width="2"/>
        <!-- Kalın Pofuduk Atkı -->
        <rect x="20" y="85" width="70" height="22" rx="11" fill="#00cec9"/>
        <rect x="58" y="95" width="18" height="30" rx="6" fill="#00cec9"/>
      </g>
      <!-- Kar Taneleri -->
      <text x="25" y="55" font-size="28">❄️</text>
      <text x="175" y="45" font-size="34">❄️</text>
      <text x="180" y="115" font-size="24">⛄</text>
    </svg>
  `,

  // 12. Fotoğraftaki Hayvanı Tanımak
  hayvan: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="camScreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2d3436"/>
          <stop offset="100%" stop-color="#1e272e"/>
        </linearGradient>
      </defs>
      <!-- Kamera Ekranı / Vizör -->
      <rect x="30" y="15" width="180" height="135" rx="20" fill="url(#camScreen)" stroke="#576574" stroke-width="4"/>
      <!-- Vizör Köşe Çizgileri (Targeting) -->
      <path d="M 50 45 L 40 45 L 40 60" fill="none" stroke="#2ecc71" stroke-width="4" stroke-linecap="round"/>
      <path d="M 190 45 L 200 45 L 200 60" fill="none" stroke="#2ecc71" stroke-width="4" stroke-linecap="round"/>
      <path d="M 50 125 L 40 125 L 40 110" fill="none" stroke="#2ecc71" stroke-width="4" stroke-linecap="round"/>
      <path d="M 190 125 L 200 125 L 200 110" fill="none" stroke="#2ecc71" stroke-width="4" stroke-linecap="round"/>
      
      <!-- Sevimli Kedi Kafası -->
      <g transform="translate(85, 45)">
        <polygon points="10,25 20,0 35,20" fill="#feca57"/>
        <polygon points="60,20 75,0 85,25" fill="#feca57"/>
        <circle cx="47" cy="40" r="30" fill="#feca57"/>
        <circle cx="36" cy="38" r="5" fill="#2d3436"/>
        <circle cx="58" cy="38" r="5" fill="#2d3436"/>
        <polygon points="44,48 50,48 47,52" fill="#ff7675"/>
      </g>
      <!-- Yeşil Onay Rozeti: KEDİ %100 -->
      <rect x="68" y="118" width="104" height="24" rx="8" fill="#2ecc71"/>
      <text x="120" y="135" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">✓ KEDİ %100</text>
    </svg>
  `,

  // 13. Büyümek
  buyumek: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rulerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffeaa7"/>
          <stop offset="100%" stop-color="#fdcb6e"/>
        </linearGradient>
      </defs>
      <!-- Boy Ölçüm Cetveli -->
      <g transform="translate(160, 15)">
        <rect x="0" y="0" width="30" height="145" rx="6" fill="url(#rulerGrad)" stroke="#e17055" stroke-width="3"/>
        <line x1="18" y1="20" x2="28" y2="20" stroke="#d63031" stroke-width="3"/>
        <line x1="22" y1="35" x2="28" y2="35" stroke="#2d3436" stroke-width="2"/>
        <line x1="18" y1="50" x2="28" y2="50" stroke="#d63031" stroke-width="3"/>
        <line x1="22" y1="65" x2="28" y2="65" stroke="#2d3436" stroke-width="2"/>
        <line x1="18" y1="80" x2="28" y2="80" stroke="#d63031" stroke-width="3"/>
        <line x1="22" y1="95" x2="28" y2="95" stroke="#2d3436" stroke-width="2"/>
        <line x1="18" y1="110" x2="28" y2="110" stroke="#d63031" stroke-width="3"/>
      </g>
      <!-- Minik Bebekten Büyüyen Çocuğa -->
      <!-- 1. Adım: Minik Fidan -->
      <g transform="translate(45, 95)">
        <ellipse cx="15" cy="35" rx="15" ry="6" fill="#81ecec" opacity="0.4"/>
        <text font-size="34">👶</text>
      </g>
      <!-- Ok -->
      <path d="M 85 105 Q 95 90 105 105" fill="none" stroke="#ff7675" stroke-width="4" stroke-linecap="round"/>
      <polygon points="108,102 112,108 103,109" fill="#ff7675"/>
      <!-- 2. Adım: Koşan Büyük Çocuk -->
      <g transform="translate(100, 45)">
        <text font-size="46">🧒</text>
      </g>
      <text x="35" y="45" font-size="28">🌱</text>
    </svg>
  `,

  // 14. Sesli Komutla Müzik Açmak
  muzik: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="speakerGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#485460"/>
          <stop offset="100%" stop-color="#1e272e"/>
        </linearGradient>
        <radialGradient id="ringLight" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stop-color="#00d2d3"/>
          <stop offset="100%" stop-color="#00cec9"/>
        </radialGradient>
      </defs>
      <!-- 3D Akıllı Silindir Hoparlör -->
      <g transform="translate(85, 45)">
        <!-- Gövde -->
        <rect x="0" y="20" width="70" height="75" rx="14" fill="url(#speakerGrad)" stroke="#111" stroke-width="3"/>
        <!-- Üst Kısım & Parlayan Halka -->
        <ellipse cx="35" cy="20" rx="35" ry="12" fill="#2d3436"/>
        <ellipse cx="35" cy="20" rx="28" ry="9" fill="url(#ringLight)"/>
        <!-- Taban -->
        <ellipse cx="35" cy="95" rx="35" ry="12" fill="#1e272e"/>
        <!-- Mikrofon Simgesi -->
        <rect x="28" y="46" width="14" height="22" rx="7" fill="#ffffff" opacity="0.8"/>
        <path d="M 23 58 A 12 12 0 0 0 47 58" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.8"/>
        <line x1="35" y1="70" x2="35" y2="76" stroke="#ffffff" stroke-width="2.5" opacity="0.8"/>
      </g>
      <!-- Havada Uçuşan Renkli Müzik Notaları -->
      <text x="35" y="60" font-size="34" fill="#ff7675">🎵</text>
      <text x="170" y="55" font-size="38" fill="#feca57">🎶</text>
      <text x="185" y="115" font-size="28" fill="#1dd1a1">🎵</text>
      <text x="25" y="120" font-size="24">✨</text>
    </svg>
  `,

  // 15. Sevgiyi Hissetmek
  sevgi: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heartGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ff7675"/>
          <stop offset="70%" stop-color="#d63031"/>
          <stop offset="100%" stop-color="#b71540"/>
        </radialGradient>
        <filter id="heartShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#ff4757" flood-opacity="0.4"/>
        </filter>
      </defs>
      <!-- Altın Kanatlar -->
      <g fill="#feca57" opacity="0.85">
        <path d="M 60 75 C 30 50, 10 70, 15 95 C 35 90, 50 85, 60 75 Z"/>
        <path d="M 180 75 C 210 50, 230 70, 225 95 C 205 90, 190 85, 180 75 Z"/>
      </g>
      <!-- Kocaman Parlayan 3D Kalp -->
      <g transform="translate(65, 25)" filter="url(#heartShadow)">
        <path d="M 55 105 L 48 98 C 18 70, 0 54, 0 35 C 0 15, 15 0, 35 0 C 47 0, 58 6, 65 16 C 72 6, 83 0, 95 0 C 115 0, 130 15, 130 35 C 130 54, 112 70, 82 98 Z" fill="url(#heartGrad)"/>
        <!-- Kalp Parlaması -->
        <ellipse cx="35" cy="25" rx="14" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-30 35 25)"/>
      </g>
      <!-- Sarılma / Sıcaklık Yıldızları -->
      <text x="25" y="45" font-size="28">✨</text>
      <text x="185" y="45" font-size="28">💖</text>
      <text x="110" y="160" font-size="24">🥰</text>
    </svg>
  `,

  // 16. Metni Sesli Okumak
  metin_oku: `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bookCover" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#5f27cd"/>
          <stop offset="100%" stop-color="#341f97"/>
        </linearGradient>
      </defs>
      <!-- Açık Renkli Masal Kitabı -->
      <g transform="translate(45, 35)">
        <!-- Kapak Kenarı -->
        <path d="M 0 85 Q 75 95 150 85 L 150 90 Q 75 100 0 90 Z" fill="url(#bookCover)"/>
        <!-- Sol Sayfa -->
        <path d="M 5 20 Q 40 12 75 22 L 75 85 Q 40 75 5 85 Z" fill="#ffffff" stroke="#c8d6e5" stroke-width="2"/>
        <!-- Sağ Sayfa -->
        <path d="M 75 22 Q 110 12 145 20 L 145 85 Q 110 75 75 85 Z" fill="#f8f9fa" stroke="#c8d6e5" stroke-width="2"/>
        <!-- Kitap Satırları -->
        <line x1="18" y1="38" x2="62" y2="38" stroke="#a4b0be" stroke-width="3" stroke-linecap="round"/>
        <line x1="18" y1="52" x2="58" y2="52" stroke="#a4b0be" stroke-width="3" stroke-linecap="round"/>
        <line x1="18" y1="66" x2="50" y2="66" stroke="#a4b0be" stroke-width="3" stroke-linecap="round"/>
        <line x1="88" y1="38" x2="132" y2="38" stroke="#a4b0be" stroke-width="3" stroke-linecap="round"/>
        <line x1="88" y1="52" x2="128" y2="52" stroke="#a4b0be" stroke-width="3" stroke-linecap="round"/>
        <line x1="88" y1="66" x2="120" y2="66" stroke="#a4b0be" stroke-width="3" stroke-linecap="round"/>
      </g>
      <!-- Kitaptan Çıkan Ses Dalgaları & Konuşma -->
      <g transform="translate(155, 25)">
        <text font-size="34">📢</text>
      </g>
      <text x="25" y="45" font-size="28">📖</text>
      <path d="M 175 60 Q 195 70 175 80" fill="none" stroke="#00cec9" stroke-width="4" stroke-linecap="round"/>
      <path d="M 185 52 Q 212 70 185 88" fill="none" stroke="#00cec9" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `
};

// Mini Karakter Avatarları (Bölgeler için)
const AVATAR_HUMAN_MINI = `
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#ffe3cf" stroke="#ff7675" stroke-width="4"/>
    <circle cx="36" cy="46" r="5" fill="#2d1607"/>
    <circle cx="64" cy="46" r="5" fill="#2d1607"/>
    <circle cx="34" cy="44" r="1.5" fill="#fff"/>
    <circle cx="62" cy="44" r="1.5" fill="#fff"/>
    <ellipse cx="28" cy="56" rx="6" ry="4" fill="#ff7675" opacity="0.5"/>
    <ellipse cx="72" cy="56" rx="6" ry="4" fill="#ff7675" opacity="0.5"/>
    <path d="M 40 60 Q 50 72 60 60" fill="none" stroke="#682405" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M 15 36 C 25 15, 75 15, 85 36 Z" fill="#7a431d"/>
  </svg>
`;

const AVATAR_AI_MINI = `
  <svg viewBox="0 0 100 100">
    <rect x="10" y="20" width="80" height="68" rx="22" fill="#0abde3" stroke="#00d2d3" stroke-width="4"/>
    <rect x="20" y="32" width="60" height="42" rx="12" fill="#1e272e"/>
    <ellipse cx="36" cy="50" rx="6" ry="8" fill="#00d2d3"/>
    <circle cx="37" cy="48" r="2" fill="#ffffff"/>
    <ellipse cx="64" cy="50" rx="6" ry="8" fill="#00d2d3"/>
    <circle cx="65" cy="48" r="2" fill="#ffffff"/>
    <path d="M 42 63 Q 50 70 58 63" fill="none" stroke="#00d2d3" stroke-width="3" stroke-linecap="round"/>
    <circle cx="50" cy="10" r="7" fill="#feca57"/>
    <rect x="47" y="12" width="6" height="10" fill="#008cb0"/>
  </svg>
`;

// ==========================================================================
// 4. OYUN VERİ LİSTESİ (16 KART - 6 YAŞ İÇİN BASİT VE NET ANLATIMLI)
// ==========================================================================
const GAME_ITEMS = [
  {
    id: "yemek",
    title: "YEMEK YEMEK",
    type: "human",
    desc: "Karnı acıkınca lezzetli yemekler yemek",
    say: "Yemek yemek. Karnı acıkınca yemek yemek kime aittir?",
    artKey: "yemek"
  },
  {
    id: "sorular",
    title: "SORULARI YANITLAMAK",
    type: "ai",
    desc: "Sorulan her soruya bilgisayardan cevap vermek",
    say: "Soruları yanıtlamak. Bilgisayardan sorulara anında cevap vermek kime aittir?",
    artKey: "sorular"
  },
  {
    id: "uyumak",
    title: "UYUMAK",
    type: "human",
    desc: "Yorulunca yatağa yatıp mışıl mışıl uyumak",
    say: "Uyumak. Yorulunca yatağa yatıp uyumak kime aittir?",
    artKey: "uyumak"
  },
  {
    id: "yol",
    title: "YOL TARİF ETMEK",
    type: "ai",
    desc: "Haritadan gideceğimiz yolu göstermek",
    say: "Yol tarif etmek. Navigasyondan yol göstermek kime aittir?",
    artKey: "yol"
  },
  {
    id: "su",
    title: "SU İÇMEK",
    type: "human",
    desc: "Susamak ve kana kana taze su içmek",
    say: "Su içmek. Susayınca taze su içmek kime aittir?",
    artKey: "su"
  },
  {
    id: "hava",
    title: "HAVA DURUMUNU SÖYLEMEK",
    type: "ai",
    desc: "Yarın havanın yağmurlu mu güneşli mi olacağını bilmek",
    say: "Hava durumunu söylemek. Havanın güneşli mi yağmurlu mu olacağını söylemek kime aittir?",
    artKey: "hava"
  },
  {
    id: "uzulmek",
    title: "ÜZÜLMEK",
    type: "human",
    desc: "Bazen üzülmek, ağlamak ve duygulanmak",
    say: "Üzülmek. Kalbi kırılmak ve üzülmek kime aittir?",
    artKey: "uzulmek"
  },
  {
    id: "cizim",
    title: "ÇİZİME YARDIM ETMEK",
    type: "ai",
    desc: "Bilgisayarda rengarenk resimler çizmek",
    say: "Çizime yardım etmek. Bilgisayarda resim çizmeye yardım etmek kime aittir?",
    artKey: "cizim"
  },
  {
    id: "mutlu",
    title: "MUTLU OLMAK",
    type: "human",
    desc: "Sevinçten havalara uçmak ve kahkaha atmak",
    say: "Mutlu olmak. Sevinçten kahkahalarla gülmek kime aittir?",
    artKey: "mutlu"
  },
  {
    id: "hatirlat",
    title: "HATIRLATMA YAPMAK",
    type: "ai",
    desc: "Zil çalarak ders veya ilaç saatini hatırlatmak",
    say: "Hatırlatma yapmak. Alarm çalıp saati hatırlatmak kime aittir?",
    artKey: "hatirlat"
  },
  {
    id: "usumek",
    title: "ÜŞÜMEK",
    type: "human",
    desc: "Kışın soğukta tir tir titreyip üşümek",
    say: "Üşümek. Soğukta atkı takıp üşümek kime aittir?",
    artKey: "usumek"
  },
  {
    id: "hayvan",
    title: "HAYVANI TANIMAK",
    type: "ai",
    desc: "Fotoğrafa bakıp kediyi köpeği hemen tanımak",
    say: "Fotoğraftaki hayvanı tanımak. Fotoğraftaki kediyi köpeği hemen tanımak kime aittir?",
    artKey: "hayvan"
  },
  {
    id: "buyumek",
    title: "BÜYÜMEK",
    type: "human",
    desc: "Zamanla boyu uzamak ve kocaman büyümek",
    say: "Büyümek. Zamanla boyu uzayıp büyümek kime aittir?",
    artKey: "buyumek"
  },
  {
    id: "muzik",
    title: "MÜZİK AÇMAK",
    type: "ai",
    desc: "Sesli komutla hemen sevdiğimiz şarkıyı başlatmak",
    say: "Sesli komutla müzik açmak. Şarkı çal deyince şarkıyı başlatmak kime aittir?",
    artKey: "muzik"
  },
  {
    id: "sevgi",
    title: "SEVGİYİ HİSSETMEK",
    type: "human",
    desc: "Anneye, babaya ve arkadaşlara sıcacık sarılmak",
    say: "Sevgiyi hissetmek. Kalbinde sıcacık sevgiyi hissetmek kime aittir?",
    artKey: "sevgi"
  },
  {
    id: "metin_oku",
    title: "METNİ SESLİ OKUMAK",
    type: "ai",
    desc: "Yazılı bir kitabı veya yazıyı sesli okumak",
    say: "Metni sesli okumak. Kitaptaki yazıları sesli olarak okumak kime aittir?",
    artKey: "metin_oku"
  }
];

// ==========================================================================
// 5. SESLENDİRME VE OYUN DURUMU (Game Controller)
// ==========================================================================
const DOM = {
  intro: document.getElementById("intro"),
  game: document.getElementById("game"),
  finish: document.getElementById("finish"),
  cardStage: document.getElementById("cardStage"),
  card: document.getElementById("card"),
  cardImage: document.getElementById("cardImage"),
  cardTitle: document.getElementById("cardTitle"),
  cardDesc: document.getElementById("cardDescription"),
  promptText: document.getElementById("promptText"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
  feedback: document.getElementById("feedback"),
  feedbackEmoji: document.getElementById("feedbackEmoji"),
  feedbackMsg: document.getElementById("feedbackMessage"),
  scoreText: document.getElementById("scoreText"),
  startBtn: document.getElementById("startBtn"),
  againBtn: document.getElementById("againBtn"),
  repeatBtn: document.getElementById("repeatBtn"),
  soundBtn: document.getElementById("soundBtn"),
  humanZone: document.getElementById("humanZone"),
  aiZone: document.getElementById("aiZone")
};

// Mini avatarları bölgelere yerleştir
document.querySelector(".character-human-avatar").innerHTML = AVATAR_HUMAN_MINI;
document.querySelector(".character-ai-avatar").innerHTML = AVATAR_AI_MINI;

let deck = [];
let currentIndex = 0;
let score = 0;
let soundEnabled = true;
let isLocked = false;
let isCardSelected = false;
let currentItem = null;

// Rastgele Karıştırma
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Türkçe Seslendirme Motoru
function speak(text) {
  if (!soundEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "tr-TR";
  utterance.rate = 0.88; // 6 yaş için sakin ve net
  utterance.pitch = 1.15; // Neşeli ve sevecen ton

  const voices = window.speechSynthesis.getVoices();
  const trVoice = voices.find(v => v.lang.startsWith("tr") && /female|filiz|yelda/i.test(v.name)) ||
                  voices.find(v => v.lang.startsWith("tr")) ||
                  null;
  if (trVoice) utterance.voice = trVoice;

  window.speechSynthesis.speak(utterance);
}

// Oyunu Başlat
function startGame() {
  sfx.playPop();
  deck = shuffle(GAME_ITEMS);
  currentIndex = 0;
  score = 0;

  DOM.intro.classList.add("hidden");
  DOM.finish.classList.add("hidden");
  DOM.game.classList.remove("hidden");

  loadCard();
  speak("Hoş geldin! Resme bak ve düşün. Bu özellik sence insana mı ait, yapay zekâ robotuna mı?");
}

// Yeni Kartı Yükle
function loadCard() {
  isLocked = false;
  isCardSelected = false;
  DOM.card.classList.remove("selected", "correct", "wrong");
  resetCardTransform();
  hideFeedback();

  currentItem = deck[currentIndex];

  // Görseli yerleştir
  DOM.cardImage.innerHTML = SVG_ARTS[currentItem.artKey] || "";
  DOM.cardTitle.textContent = currentItem.title;
  DOM.cardDesc.textContent = currentItem.desc;

  // İlerleme Çubuğu
  const progressPercent = ((currentIndex) / deck.length) * 100;
  DOM.progressBar.style.width = `${progressPercent}%`;
  DOM.progressText.textContent = `${currentIndex + 1} / ${deck.length}`;

  DOM.promptText.textContent = `"${currentItem.title}" kime aittir?`;

  // Kısa bekleme ile soruyu seslendir
  setTimeout(() => {
    if (currentItem) speak(currentItem.say);
  }, 400);
}

// Kullanıcı Tercih Yaptığında (İnsan veya Yapay Zekâ)
function handleChoice(chosenType, triggerElement) {
  if (isLocked) return;
  isLocked = true;

  const isCorrect = (chosenType === currentItem.type);

  if (isCorrect) {
    score++;
    sfx.playSuccess();
    DOM.card.classList.add("correct");

    // Hedef bölgeye doğru konfeti patlat
    const rect = triggerElement.getBoundingClientRect();
    confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);

    const goodPraise = [
      "Aferin sana! Harika düşündün! 🌟",
      "Doğru cevap! Çok akıllısın! 👏",
      "Süpersin! Tam yerine koydun! 🎉",
      "Harika gidiyorsun minik kaşif! 🚀"
    ];
    const praise = goodPraise[Math.floor(Math.random() * goodPraise.length)];
    showFeedback("good", praise);
    speak(praise);

    setTimeout(() => {
      currentIndex++;
      if (currentIndex >= deck.length) {
        finishGame();
      } else {
        loadCard();
      }
    }, 1350);

  } else {
    sfx.playTryAgain();
    DOM.card.classList.add("wrong");

    const tryAgainTips = [
      "Bir daha düşünelim! Hadi tekrar dene. 🎈",
      "Neredeyse oluyordu! Bir daha bak bakalım. 🧐",
      "Tekrar deneyebilirsin, sen yaparsın! ✨"
    ];
    const tip = tryAgainTips[Math.floor(Math.random() * tryAgainTips.length)];
    showFeedback("try", tip);
    speak(tip);

    setTimeout(() => {
      DOM.card.classList.remove("wrong");
      isLocked = false;
    }, 1000);
  }
}

// Geri Bildirim Balonunu Göster
function showFeedback(type, message) {
  DOM.feedback.className = `feedback-3d show ${type}`;
  DOM.feedbackEmoji.textContent = (type === "good") ? "🌟" : "💡";
  DOM.feedbackMsg.textContent = message;
}

function hideFeedback() {
  DOM.feedback.className = "feedback-3d";
  DOM.feedbackEmoji.textContent = "";
  DOM.feedbackMsg.textContent = "";
}

// Oyunu Bitir ve Tebrik Ekranını Göster
function finishGame() {
  DOM.game.classList.add("hidden");
  DOM.finish.classList.remove("hidden");
  DOM.scoreText.textContent = `${score} / ${deck.length}`;

  sfx.playFanfare();
  // Kutlama Konfetisi
  confetti.burst(window.innerWidth / 2, window.innerHeight / 2 - 80, 80);
  setTimeout(() => {
    confetti.burst(window.innerWidth / 3, window.innerHeight / 2, 50);
    confetti.burst((window.innerWidth / 3) * 2, window.innerHeight / 2, 50);
  }, 450);

  speak("Tebrikler! Etkinliği tamamladın. İnsanlar ile Yapay Zekânın farklarını süper bir şekilde öğrendin!");
}

// ==========================================================================
// 6. İNTERAKTİF 3D KART EĞİMİ & FİZİK MOTORU (3D Tilt Effect)
// ==========================================================================
function resetCardTransform() {
  DOM.card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
}

DOM.cardStage.addEventListener("mousemove", (e) => {
  if (isLocked) return;
  const rect = DOM.card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -12; // Yukarı/Aşağı eğim
  const rotateY = ((x - centerX) / centerX) * 14;  // Sağa/Sola eğim

  DOM.card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
});

DOM.cardStage.addEventListener("mouseleave", () => {
  if (!DOM.card.classList.contains("selected")) {
    resetCardTransform();
  }
});

// Karta Dokunma / Seçme Desteği
DOM.card.addEventListener("click", () => {
  if (isLocked) return;
  isCardSelected = !isCardSelected;
  DOM.card.classList.toggle("selected", isCardSelected);
  sfx.playPop();

  if (isCardSelected) {
    speak("Şimdi alttaki kutulardan doğru olana dokun.");
  }
});

// ==========================================================================
// 7. SÜRÜKLE & BIRAK VE DOKUNMATİK DESTEĞİ (Drag & Drop & Touch)
// ==========================================================================
// Hedef Kutularına Tıklama
[DOM.humanZone, DOM.aiZone].forEach(zone => {
  zone.addEventListener("click", () => {
    handleChoice(zone.dataset.zone, zone);
  });

  // Drag over visual cues
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("hover-target");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("hover-target");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("hover-target");
    handleChoice(zone.dataset.zone, zone);
  });
});

DOM.card.addEventListener("dragstart", (e) => {
  e.dataTransfer.setData("text/plain", "card");
  DOM.card.style.opacity = "0.75";
  sfx.playPop();
});

DOM.card.addEventListener("dragend", () => {
  DOM.card.style.opacity = "1";
});

// Mobil / Tablet Dokunmatik Sürükleme (Touch Drag)
let touchStartX = 0;
let touchStartY = 0;

DOM.card.addEventListener("touchstart", (e) => {
  if (isLocked) return;
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });

DOM.card.addEventListener("touchmove", (e) => {
  if (isLocked) return;
  const t = e.touches[0];
  const deltaX = t.clientX - touchStartX;
  const deltaY = t.clientY - touchStartY;

  // Kartı parmak yönünde 3D eğ ve taşı
  DOM.card.style.transform = `perspective(1000px) translate3d(${deltaX * 0.4}px, ${deltaY * 0.4}px, 0) rotateZ(${deltaX * 0.05}deg)`;

  // Sürüklenen bölgeyi aydınlat
  if (deltaX < -50) {
    DOM.humanZone.classList.add("hover-target");
    DOM.aiZone.classList.remove("hover-target");
  } else if (deltaX > 50) {
    DOM.aiZone.classList.add("hover-target");
    DOM.humanZone.classList.remove("hover-target");
  } else {
    DOM.humanZone.classList.remove("hover-target");
    DOM.aiZone.classList.remove("hover-target");
  }
}, { passive: true });

DOM.card.addEventListener("touchend", (e) => {
  if (isLocked) return;
  const changedTouch = e.changedTouches[0];
  const deltaX = changedTouch.clientX - touchStartX;

  DOM.humanZone.classList.remove("hover-target");
  DOM.aiZone.classList.remove("hover-target");
  resetCardTransform();

  // Yeterince sola çekildiyse İNSAN, sağa çekildiyse YAPAY ZEKÂ
  if (deltaX < -70) {
    handleChoice("human", DOM.humanZone);
  } else if (deltaX > 70) {
    handleChoice("ai", DOM.aiZone);
  }
});

// ==========================================================================
// 8. BUTON KONTROLLERİ VE ETKİNLİKLER
// ==========================================================================
DOM.startBtn.addEventListener("click", startGame);
DOM.againBtn.addEventListener("click", startGame);

DOM.repeatBtn.addEventListener("click", () => {
  sfx.playPop();
  if (currentItem) {
    speak(currentItem.say);
  }
});

DOM.soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  sfx.muted = !soundEnabled;
  DOM.soundBtn.classList.toggle("muted", !soundEnabled);

  if (!soundEnabled) {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  } else {
    sfx.playPop();
    speak("Ses açıldı.");
  }
});

// Klavyeyle Erişilebilirlik (Sol Ok = İnsan, Sağ Ok = Yapay Zekâ)
window.addEventListener("keydown", (e) => {
  if (DOM.game.classList.contains("hidden") || isLocked) return;
  if (e.key === "ArrowLeft") {
    handleChoice("human", DOM.humanZone);
  } else if (e.key === "ArrowRight") {
    handleChoice("ai", DOM.aiZone);
  }
});
