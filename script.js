    // <!-- LÓGICA INTERACTIVA, SONIDO Y PARTÍCULAS -->
        /**************************************************************
         * 1. SISTEMA DE AUDIO SINTETIZADO (WEB AUDIO API)
         **************************************************************/
        class BirthdaySoundEngine {
            constructor() {
                this.ctx = null;
                this.enabled = true;
            }

            init() {
                if (!this.ctx) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) {
                        this.ctx = new AudioCtx();
                    }
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            }

            playNote(freq, startTime, duration, type = 'triangle', volume = 0.14) {
                if (!this.enabled) return;
                this.init();
                if (!this.ctx) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + duration);
            }

            playSparkleChime(pitchMultiplier = 1) {
                if (!this.enabled) return;
                this.init();
                if (!this.ctx) return;

                const now = this.ctx.currentTime;
                const freqs = [523.25, 659.25, 783.99, 1046.50].map(f => f * pitchMultiplier);
                freqs.forEach((f, idx) => {
                    this.playNote(f, now + idx * 0.06, 0.35, 'sine', 0.1);
                });
            }

            playHappyBirthdayMelody() {
                if (!this.enabled) return;
                this.init();
                if (!this.ctx) return;

                const now = this.ctx.currentTime + 0.05;
                // Notas de "Cumpleaños Feliz" (Do mayor / Fa mayor)
                const melody = [
                    { f: 261.63, d: 0.28, t: 0.0 },   // C4
                    { f: 261.63, d: 0.22, t: 0.32 },  // C4
                    { f: 293.66, d: 0.45, t: 0.58 },  // D4
                    { f: 261.63, d: 0.45, t: 1.08 },  // C4
                    { f: 349.23, d: 0.45, t: 1.58 },  // F4
                    { f: 329.63, d: 0.80, t: 2.08 },  // E4

                    { f: 261.63, d: 0.28, t: 3.00 },  // C4
                    { f: 261.63, d: 0.22, t: 3.32 },  // C4
                    { f: 293.66, d: 0.45, t: 3.58 },  // D4
                    { f: 261.63, d: 0.45, t: 4.08 },  // C4
                    { f: 392.00, d: 0.45, t: 4.58 },  // G4
                    { f: 349.23, d: 0.85, t: 5.08 },  // F4

                    { f: 261.63, d: 0.28, t: 6.00 },  // C4
                    { f: 261.63, d: 0.22, t: 6.32 },  // C4
                    { f: 523.25, d: 0.45, t: 6.58 },  // C5
                    { f: 440.00, d: 0.45, t: 7.08 },  // A4
                    { f: 349.23, d: 0.45, t: 7.58 },  // F4
                    { f: 329.63, d: 0.45, t: 8.08 },  // E4
                    { f: 293.66, d: 0.75, t: 8.58 },  // D4

                    { f: 466.16, d: 0.28, t: 9.45 },  // Bb4
                    { f: 466.16, d: 0.22, t: 9.77 },  // Bb4
                    { f: 440.00, d: 0.45, t: 10.03 }, // A4
                    { f: 349.23, d: 0.45, t: 10.53 }, // F4
                    { f: 392.00, d: 0.45, t: 11.03 }, // G4
                    { f: 349.23, d: 0.95, t: 11.53 }  // F4
                ];

                melody.forEach(note => {
                    this.playNote(note.f, now + note.t, note.d, 'triangle', 0.16);
                    // Armónico superior brillante tipo cajita musical
                    this.playNote(note.f * 2, now + note.t, note.d * 0.8, 'sine', 0.05);
                });
            }
        }

        const soundEngine = new BirthdaySoundEngine();

        /**************************************************************
         * 2. SISTEMA DE ESTRELLAS DE FONDO Y CONFETI BRILLANTE (CANVAS)
         **************************************************************/
        const bgCanvas = document.getElementById('bgSparkleCanvas');
        const bgCtx = bgCanvas.getContext('2d');
        const confettiCanvas = document.getElementById('confettiCanvas');
        const confettiCtx = confettiCanvas.getContext('2d');

        let stars = [];
        let confettiParticles = [];

        function resizeCanvases() {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }

        function initStars() {
            stars = [];
            const count = Math.min(85, Math.floor((window.innerWidth * window.innerHeight) / 14000));
            const colors = ['#fde047', '#f472b6', '#67e8f9', '#e879f9', '#ffffff'];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * bgCanvas.width,
                    y: Math.random() * bgCanvas.height,
                    radius: Math.random() * 2.4 + 0.8,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: Math.random(),
                    speedAlpha: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
                    vy: -(Math.random() * 0.25 + 0.08)
                });
            }
        }

        function launchConfetti(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 90) {
            const colors = ['#fde047', '#f472b6', '#67e8f9', '#c084fc', '#4ade80', '#fb7185', '#ffffff'];
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 11 + 3;
                confettiParticles.push({
                    x: originX,
                    y: originY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 3.5,
                    size: Math.random() * 8 + 5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 12,
                    gravity: 0.18,
                    alpha: 1,
                    shape: Math.random() > 0.35 ? 'rect' : 'circle'
                });
            }
        }

        function animateCanvases() {
            // 1. Fondo de estrellas brillantes
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            stars.forEach(s => {
                s.alpha += s.speedAlpha;
                if (s.alpha <= 0.15 || s.alpha >= 1) s.speedAlpha *= -1;
                s.y += s.vy;
                if (s.y < 0) s.y = bgCanvas.height;

                bgCtx.save();
                bgCtx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
                bgCtx.fillStyle = s.color;
                bgCtx.shadowBlur = 10;
                bgCtx.shadowColor = s.color;
                bgCtx.beginPath();
                bgCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                bgCtx.fill();
                bgCtx.restore();
            });

            // 2. Confeti y destellos interactivos
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            for (let i = confettiParticles.length - 1; i >= 0; i--) {
                const p = confettiParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= 0.99;
                p.rotation += p.rotationSpeed;
                p.alpha -= 0.008;

                if (p.alpha <= 0 || p.y > confettiCanvas.height + 40) {
                    confettiParticles.splice(i, 1);
                    continue;
                }

                confettiCtx.save();
                confettiCtx.globalAlpha = p.alpha;
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate((p.rotation * Math.PI) / 180);
                confettiCtx.fillStyle = p.color;
                confettiCtx.shadowBlur = 8;
                confettiCtx.shadowColor = p.color;

                if (p.shape === 'circle') {
                    confettiCtx.beginPath();
                    confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    confettiCtx.fill();
                } else {
                    confettiCtx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
                }
                confettiCtx.restore();
            }

            requestAnimationFrame(animateCanvases);
        }

        // Destellos al hacer clic en cualquier parte de la página
        window.addEventListener('click', (e) => {
            if (e.target.closest('button, a, input, #closedEnvelopeView, .candle-group')) return;
            launchConfetti(e.clientX, e.clientY, 18);
        });

        /**************************************************************
         * 3. GLOBOS DE CUMPLEAÑOS FLOTANTES
         **************************************************************/
        function releaseBalloons(quantity = 14) {
            const balloonColors = [
                'from-pink-400 to-rose-600',
                'from-purple-400 to-indigo-600',
                'from-yellow-300 to-amber-500',
                'from-cyan-300 to-blue-500',
                'from-emerald-300 to-teal-500',
                'from-fuchsia-400 to-pink-600'
            ];
            const emojis = ['🎈', '✨', '💖', 'Ψ', '🎂', '🌟'];

            for (let i = 0; i < quantity; i++) {
                const balloon = document.createElement('div');
                const colorClass = balloonColors[i % balloonColors.length];
                const leftPos = Math.random() * 90 + 5;
                const duration = Math.random() * 4 + 5.5;
                const delay = Math.random() * 1.5;

                balloon.className = `balloon flex flex-col items-center`;
                balloon.style.left = `${leftPos}vw`;
                balloon.style.animationDuration = `${duration}s`;
                balloon.style.animationDelay = `${delay}s`;

                balloon.innerHTML = `
                    <div class="w-14 h-16 sm:w-16 sm:h-20 rounded-full bg-gradient-to-br ${colorClass} shadow-[0_0_25px_rgba(255,255,255,0.5)] border border-white/50 flex items-center justify-center text-xl font-bold relative">
                        <div class="absolute top-2 left-3 w-3 h-5 rounded-full bg-white/40 rotate-[-25deg]"></div>
                        <span>${emojis[i % emojis.length]}</span>
                    </div>
                    <div class="w-0.5 h-12 bg-white/50"></div>
                `;

                document.body.appendChild(balloon);
                setTimeout(() => balloon.remove(), (duration + delay + 0.5) * 1000);
            }
        }

        /**************************************************************
         * 4. PASTEL INTERACTIVO Y VELAS
         **************************************************************/
        const totalCandles = 5;
        let extinguishedCandles = new Set();

        function extinguishSingleCandle(index) {
            if (extinguishedCandles.has(index)) return;
            extinguishedCandles.add(index);

            const flame = document.getElementById(`flame-${index}`);
            const smoke = document.getElementById(`smoke-${index}`);
            if (flame) flame.classList.add('extinguished');
            if (smoke) {
                smoke.classList.remove('active');
                void smoke.offsetWidth;
                smoke.classList.add('active');
            }

            soundEngine.playSparkleChime(1 + index * 0.1);

            if (extinguishedCandles.size === totalCandles) {
                triggerAllCandlesBlownCelebration();
            }
        }

        function triggerAllCandlesBlownCelebration() {
            for (let i = 0; i < totalCandles; i++) {
                const flame = document.getElementById(`flame-${i}`);
                const smoke = document.getElementById(`smoke-${i}`);
                if (flame && !flame.classList.contains('extinguished')) {
                    flame.classList.add('extinguished');
                }
                if (smoke) {
                    smoke.classList.remove('active');
                    void smoke.offsetWidth;
                    smoke.classList.add('active');
                }
                extinguishedCandles.add(i);
            }

            // Mostrar banners y botones
            document.getElementById('wishGrantedBanner').classList.remove('hidden');
            document.getElementById('blowCandlesBtn').classList.add('hidden');
            document.getElementById('relightCandlesBtn').classList.remove('hidden');
            document.getElementById('cakeStatusText').textContent = '✨ ¡Las velas se han apagado! Escucha tu melodía de cumpleaños, Doris, y mira subir los globos de parte de Daryl. ✨';

            // Lanzar ráfagas de confeti, globos y melodía
            soundEngine.playHappyBirthdayMelody();
            releaseBalloons(18);
            launchConfetti(window.innerWidth * 0.25, window.innerHeight * 0.5, 80);
            setTimeout(() => launchConfetti(window.innerWidth * 0.75, window.innerHeight * 0.5, 80), 300);
            setTimeout(() => launchConfetti(window.innerWidth * 0.5, window.innerHeight * 0.35, 110), 650);
            showToast('🎂 ¡Feliz Cumpleaños, Doris Huamaní Jordán! Con cariño, Daryl ✨', '🎉');
        }

        function relightAllCandles() {
            extinguishedCandles.clear();
            for (let i = 0; i < totalCandles; i++) {
                const flame = document.getElementById(`flame-${i}`);
                const smoke = document.getElementById(`smoke-${i}`);
                if (flame) flame.classList.remove('extinguished');
                if (smoke) smoke.classList.remove('active');
            }
            document.getElementById('wishGrantedBanner').classList.add('hidden');
            document.getElementById('blowCandlesBtn').classList.remove('hidden');
            document.getElementById('relightCandlesBtn').classList.add('hidden');
            document.getElementById('cakeStatusText').textContent = '¡Velas encendidas de nuevo, Doris! Pide otro deseo cuando quieras.';
            soundEngine.playSparkleChime(1.2);
        }

        // Eventos en cada vela individual y botones del pastel
        document.querySelectorAll('.candle-group').forEach(group => {
            group.addEventListener('click', () => {
                const idx = parseInt(group.getAttribute('data-candle'), 10);
                extinguishSingleCandle(idx);
            });
        });

        document.getElementById('blowCandlesBtn').addEventListener('click', triggerAllCandlesBlownCelebration);
        document.getElementById('relightCandlesBtn').addEventListener('click', relightAllCandles);

        /**************************************************************
         * 5. PANEL DE NEUROTRANSMISORES DE CUMPLEAÑOS DE DORIS
         **************************************************************/
        const neurotransmittersData = [
            {
                id: 'dopamina',
                name: 'Dopamina',
                subtitle: 'Motivación y Festejo',
                icon: '🎁',
                colorFrom: 'from-pink-500',
                colorTo: 'to-rose-400',
                borderClass: 'border-pink-400/40',
                level: 250,
                messages: {
                    low: 'Expectativa alegre de cumpleaños activada para Doris.',
                    mid: '¡Motivación festiva en aumento! Ganas de celebrar cada meta lograda.',
                    max: '🔥 ¡1000% DOPAMINA! Recompensa cerebral máxima para Doris Huamaní Jordán: ¡Éxito, sorpresas y festejo total!'
                }
            },
            {
                id: 'serotonina',
                name: 'Serotonina',
                subtitle: 'Bienestar y Plenitud',
                icon: '☀️',
                colorFrom: 'from-amber-400',
                colorTo: 'to-yellow-300',
                borderClass: 'border-amber-300/40',
                level: 300,
                messages: {
                    low: 'Calma luminosa y satisfacción presentes en su día.',
                    mid: 'Equilibrio emocional radiante y orgullo por su vocación psicológica.',
                    max: '✨ ¡1000% SEROTONINA! Plenitud absoluta, paz interior y alegría radiante para la Lic. Doris.'
                }
            },
            {
                id: 'oxitocina',
                name: 'Oxitocina',
                subtitle: 'Cariño y Amistad Verdadera',
                icon: '🤗',
                colorFrom: 'from-purple-500',
                colorTo: 'to-fuchsia-400',
                borderClass: 'border-purple-400/40',
                level: 350,
                messages: {
                    low: 'Rodeada del aprecio sincero de Daryl y quienes la quieren.',
                    mid: 'Conexión afectiva profunda y muestras de admiración.',
                    max: '💖 ¡1000% OXITOCINA! Abrazos sinceros, amistad verdadera y un cariño inmenso para Doris.'
                }
            },
            {
                id: 'endorfinas',
                name: 'Endorfinas',
                subtitle: 'Risas y Baile',
                icon: '🥳',
                colorFrom: 'from-cyan-400',
                colorTo: 'to-emerald-400',
                borderClass: 'border-cyan-300/40',
                level: 250,
                messages: {
                    low: 'Sonrisas espontáneas listas para iluminar el día.',
                    mid: 'Carcajadas terapéuticas y energía súper contagiosa.',
                    max: '🎉 ¡1000% ENDORFINAS! Risas garantizadas, baile y diversión sin límites en el cumpleaños de Doris.'
                }
            }
        ];

        function renderNeurotransmitters() {
            const grid = document.getElementById('neuroGrid');
            grid.innerHTML = '';

            neurotransmittersData.forEach((item, index) => {
                const widthPercent = Math.min(100, (item.level / 1000) * 100);
                const msg = item.level >= 1000 ? item.messages.max : (item.level >= 550 ? item.messages.mid : item.messages.low);

                const card = document.createElement('div');
                card.className = `glass-card glass-card-interactive rounded-3xl p-5 sm:p-6 border ${item.borderClass} flex flex-col justify-between gap-4`;
                card.innerHTML = `
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shadow-inner">
                                ${item.icon}
                            </div>
                            <div>
                                <h3 class="font-display text-xl font-bold text-white">${item.name}</h3>
                                <p class="text-xs text-pink-200/80">${item.subtitle}</p>
                            </div>
                        </div>
                        <span id="neuro-val-${item.id}" class="px-3 py-1 rounded-full bg-white/15 border border-white/25 font-display font-bold text-sm sm:text-base text-yellow-300">
                            ${item.level}%
                        </span>
                    </div>

                    <!-- Barra de Progreso Luminosa -->
                    <div class="w-full h-5 bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-white/20">
                        <div id="neuro-bar-${item.id}" class="neuro-bar-fill h-full rounded-full bg-gradient-to-r ${item.colorFrom} ${item.colorTo} shadow-[0_0_15px_rgba(255,255,255,0.6)]" style="width: ${widthPercent}%"></div>
                    </div>

                    <p id="neuro-msg-${item.id}" class="text-xs sm:text-sm text-pink-100/95 min-h-[2.5rem] flex items-center">
                        ${msg}
                    </p>

                    <div class="flex items-center gap-2 pt-1">
                        <button data-neuro-add="${index}" class="flex-1 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 font-display font-semibold text-xs sm:text-sm text-white transition flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-plus text-yellow-300"></i>
                            <span>Subir Dosis (+250%)</span>
                        </button>
                        <button data-neuro-max="${index}" class="py-2.5 px-4 rounded-xl bg-gradient-to-r ${item.colorFrom} ${item.colorTo} font-display font-bold text-xs sm:text-sm text-slate-950 shadow-md hover:scale-105 transition">
                            ¡Al 1000%! ✨
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });

            // Eventos para los botones de cada neurotransmisor
            grid.querySelectorAll('[data-neuro-add]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(btn.getAttribute('data-neuro-add'), 10);
                    updateNeuroLevel(idx, Math.min(1000, neurotransmittersData[idx].level + 250), e.clientX, e.clientY);
                });
            });

            grid.querySelectorAll('[data-neuro-max]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(btn.getAttribute('data-neuro-max'), 10);
                    updateNeuroLevel(idx, 1000, e.clientX, e.clientY);
                });
            });
        }

        function updateNeuroLevel(index, newLevel, clientX, clientY) {
            const item = neurotransmittersData[index];
            item.level = newLevel;
            const widthPercent = Math.min(100, (item.level / 1000) * 100);
            const msg = item.level >= 1000 ? item.messages.max : (item.level >= 550 ? item.messages.mid : item.messages.low);

            document.getElementById(`neuro-val-${item.id}`).textContent = `${item.level}%`;
            document.getElementById(`neuro-bar-${item.id}`).style.width = `${widthPercent}%`;
            document.getElementById(`neuro-msg-${item.id}`).textContent = msg;

            soundEngine.playSparkleChime(0.9 + (item.level / 1000) * 0.5);
            if (clientX && clientY) {
                launchConfetti(clientX, clientY, 28);
            }

            checkAllNeuroMaxed();
        }

        function checkAllNeuroMaxed() {
            const allMaxed = neurotransmittersData.every(n => n.level >= 1000);
            const statusEl = document.getElementById('neuroGlobalStatus');
            if (allMaxed) {
                statusEl.innerHTML = '🌟 <strong>¡DICTAMEN OFICIAL DE DARYL!</strong> Dopamina, Serotonina, Oxitocina y Endorfinas de <strong>Doris Huamaní Jordán</strong> al 1000%. ¡Felicidad suprema garantizada para hoy y todo el año! 🌟';
                showToast('🧪 ¡Felicidad de Doris elevada al 1000%!', '🥳');
            } else {
                const avg = Math.round(neurotransmittersData.reduce((acc, n) => acc + n.level, 0) / neurotransmittersData.length);
                statusEl.textContent = `Nivel promedio de felicidad neuroquímica de Doris: ${avg}% — ¡Sigue subiendo hasta alcanzar el 1000% en todos!`;
            }
        }

        document.getElementById('boostAllNeuroBtn').addEventListener('click', (e) => {
            neurotransmittersData.forEach((_, idx) => {
                updateNeuroLevel(idx, 1000);
            });
            launchConfetti(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 110);
            releaseBalloons(10);
        });

        /**************************************************************
         * 6. FRASCO DE EMOCIONES Y DIAGNÓSTICO OFICIAL DE CUMPLEAÑOS
         **************************************************************/
        const diagnosesList = [
            {
                code: 'EXPEDIENTE DSM-CUMPLEAÑOS #001',
                title: 'Escucha Activa y Calidez Humana Extraordinaria',
                icon: '🌟',
                orbColor: '#f472b6',
                orbLabel: 'Empatía',
                tag: '#PsicólogaConLuzPropia',
                observation: 'Se observa en Doris Huamaní Jordán un don admirable para la escucha activa, una calidez humana que transmite paz inmediata y una vocación genuina por la psicología que ilumina la vida de quienes la rodean.',
                prescription: 'Receta de cumpleaños: Dosis ilimitada de pastel, abrazos sinceros, éxito rotundo en cada meta y prohibido estresarse hoy.'
            },
            {
                code: 'EXPEDIENTE DSM-CUMPLEAÑOS #002',
                title: 'Vocación Brillante y Futuro Prometedor en Psicología',
                icon: '🧠',
                orbColor: '#facc15',
                orbLabel: 'Vocación',
                tag: '#LicDorisBrillante',
                observation: 'La evaluada combina sensibilidad humana, inteligencia emocional y pasión por comprender la mente. Su dedicación la convierte en una profesional admirable que deja huella positiva en cada persona.',
                prescription: 'Receta de cumpleaños: Celebrar con orgullo cada logro alcanzado y brindar por todos los éxitos profesionales y personales que vienen en este nuevo año.'
            },
            {
                code: 'EXPEDIENTE DSM-CUMPLEAÑOS #003',
                title: 'Efecto Terapéutico de Calma y Lugar Seguro',
                icon: '🦋',
                orbColor: '#38bdf8',
                orbLabel: 'Calidez',
                tag: '#AmigaIncondicional',
                observation: 'Conversar con Doris tiene un efecto ansiolítico natural: su empatía sin juicios y sus palabras acertadas hacen que cualquiera se sienta en un refugio seguro y lleno de confianza.',
                prescription: 'Receta de cumpleaños: Hoy te toca a ti ser la consentida, Doris; dejar que todos te celebren, te escuchen y te llenen de detalles bonitos.'
            },
            {
                code: 'EXPEDIENTE DSM-CUMPLEAÑOS #004',
                title: 'Alegría Contagiosa y Sonrisa Generadora de Serotonina',
                icon: '🌈',
                orbColor: '#a855f7',
                orbLabel: 'Alegría',
                tag: '#EnergíaBonita',
                observation: 'Se comprueba clínicamente que el entusiasmo y la sonrisa de Doris Huamaní Jordán elevan las endorfinas y la alegría de todo su entorno en cuestión de segundos.',
                prescription: 'Receta de cumpleaños: Reír a carcajadas, bailar sus canciones favoritas y disfrutar de una celebración inolvidable.'
            },
            {
                code: 'EXPEDIENTE DSM-CUMPLEAÑOS #005',
                title: 'Presencia Vitamina y Amistad Valiosa',
                icon: '💖',
                orbColor: '#4ade80',
                orbLabel: 'Amistad',
                tag: '#GraciasDoris',
                observation: 'Para Daryl y todos sus amigos, Doris es una auténtica "Persona Vitamina": alguien cuya nobleza, lealtad y buen corazón hacen que el mundo sea un lugar mucho más bonito.',
                prescription: 'Receta de cumpleaños: Recibir todo el cariño de quienes te admiran y guardar este recuerdo especial para siempre.'
            },
            {
                code: 'EXPEDIENTE DSM-CUMPLEAÑOS #006',
                title: 'Resiliencia Admirada y Magia en Cada Paso',
                icon: '👑',
                orbColor: '#fb923c',
                orbLabel: 'Éxito',
                tag: '#ReinaDelCumple',
                observation: 'Capacidad inspiradora para convertir retos en aprendizajes y avanzar con determinación, dulzura y valentía hacia cada uno de sus sueños.',
                prescription: 'Receta de cumpleaños: 365 días nuevos llenos de salud, viajes hermosos, prosperidad, amor bonito y metas cumplidas.'
            }
        ];

        const discoveredOrbs = new Set([0]);
        let currentDiagIndex = 0;

        function renderOrbsAndTabs() {
            const orbsContainer = document.getElementById('orbsContainer');
            const quickTabs = document.getElementById('diagQuickTabs');
            orbsContainer.innerHTML = '';
            quickTabs.innerHTML = '';

            diagnosesList.forEach((d, idx) => {
                // Esfera dentro del frasco
                const orbBtn = document.createElement('button');
                const isDiscovered = discoveredOrbs.has(idx);
                orbBtn.className = `emotion-orb w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center text-white font-display font-bold text-xs cursor-pointer ${isDiscovered ? 'discovered' : ''} ${currentDiagIndex === idx ? 'ring-4 ring-white scale-110' : ''}`;
                orbBtn.style.backgroundColor = d.orbColor;
                orbBtn.style.color = d.orbColor;
                orbBtn.innerHTML = `
                    <span class="text-xl drop-shadow">${d.icon}</span>
                    <span class="text-[9px] text-slate-950 font-extrabold uppercase tracking-tighter bg-white/80 px-1.5 rounded-full mt-0.5">${d.orbLabel}</span>
                `;
                orbBtn.addEventListener('click', (e) => {
                    selectDiagnosis(idx, e.clientX, e.clientY);
                });
                orbsContainer.appendChild(orbBtn);

                // Pestaña rápida debajo del expediente
                const tabBtn = document.createElement('button');
                tabBtn.className = `px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${currentDiagIndex === idx ? 'bg-white/25 border-yellow-300 text-yellow-200 shadow-md' : 'bg-white/5 hover:bg-white/15 border-white/15 text-pink-100/80'}`;
                tabBtn.innerHTML = `<span>${d.icon}</span><span class="truncate">${d.orbLabel}</span>`;
                tabBtn.addEventListener('click', (e) => {
                    selectDiagnosis(idx, e.clientX, e.clientY);
                });
                quickTabs.appendChild(tabBtn);
            });

            document.getElementById('orbCounter').textContent = discoveredOrbs.size;
        }

        function selectDiagnosis(index, clientX, clientY) {
            currentDiagIndex = index;
            discoveredOrbs.add(index);
            const d = diagnosesList[index];

            document.getElementById('diagIconBox').textContent = d.icon;
            document.getElementById('diagCode').textContent = d.code;
            document.getElementById('diagTitle').textContent = d.title;
            document.getElementById('diagObservation').textContent = d.observation;
            document.getElementById('diagPrescription').textContent = d.prescription;
            document.getElementById('diagVirtueTag').textContent = d.tag;

            renderOrbsAndTabs();
            soundEngine.playSparkleChime(1.05 + index * 0.08);
            if (clientX && clientY) {
                launchConfetti(clientX, clientY, 24);
            }
        }

        document.getElementById('randomOrbBtn').addEventListener('click', (e) => {
            const nextIdx = (currentDiagIndex + 1 + Math.floor(Math.random() * (diagnosesList.length - 1))) % diagnosesList.length;
            selectDiagnosis(nextIdx, e.clientX, e.clientY);
        });

        /**************************************************************
         * 7. SOBRE ANIMADO Y CARTA EDITABLE
         **************************************************************/
        const closedEnvelopeView = document.getElementById('closedEnvelopeView');
        const openLetterView = document.getElementById('openLetterView');
        const letterBodyText = document.getElementById('letterBodyText');
        let isEditingLetter = false;

        closedEnvelopeView.addEventListener('click', (e) => {
            closedEnvelopeView.classList.add('hidden');
            openLetterView.classList.remove('hidden');
            soundEngine.playSparkleChime(1.25);
            launchConfetti(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 65);
        });

        document.getElementById('closeEnvelopeBtn').addEventListener('click', () => {
            openLetterView.classList.add('hidden');
            closedEnvelopeView.classList.remove('hidden');
            soundEngine.playSparkleChime(0.85);
        });

        document.getElementById('toggleEditLetterBtn').addEventListener('click', () => {
            isEditingLetter = !isEditingLetter;
            letterBodyText.contentEditable = isEditingLetter ? 'true' : 'false';
            const btnText = document.getElementById('editLetterBtnText');
            if (isEditingLetter) {
                letterBodyText.focus();
                letterBodyText.classList.add('bg-pink-50/90', 'p-3', 'ring-2', 'ring-pink-400');
                btnText.textContent = 'Guardar Cambios';
                showToast('✍️ Puedes escribir o modificar el texto de la carta directamente.', '💌');
            } else {
                letterBodyText.classList.remove('bg-pink-50/90', 'p-3', 'ring-2', 'ring-pink-400');
                btnText.textContent = 'Editar Dedicatoria';
                showToast('💖 ¡Dedicatoria actualizada con éxito!', '✨');
            }
        });

        document.getElementById('copyLetterBtn').addEventListener('click', () => {
            const tempArea = document.createElement('textarea');
            tempArea.value = letterBodyText.innerText.trim();
            document.body.appendChild(tempArea);
            tempArea.select();
            try {
                document.execCommand('copy');
                showToast('📋 ¡Carta de Daryl para Doris copiada al portapapeles!', '💖');
            } catch (err) {
                showToast('✨ Carta lista para compartir', '💖');
            }
            tempArea.remove();
        });

        document.getElementById('printLetterBtn').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('heartShowerBtn').addEventListener('click', (e) => {
            soundEngine.playSparkleChime(1.35);
            launchConfetti(e.clientX, e.clientY, 85);
            releaseBalloons(12);
            showToast('🤗 ¡Mil abrazos llenos de cariño de parte de Daryl para ti, Doris!', '💖');
        });

        /**************************************************************
         * 8. PERSONALIZACIÓN DE NOMBRE Y SONIDO
         **************************************************************/
        const customizeModal = document.getElementById('customizeModal');
        const friendNameInput = document.getElementById('friendNameInput');
        const senderNameInput = document.getElementById('senderNameInput');

        function openCustomizeModal() {
            customizeModal.classList.remove('hidden');
            customizeModal.classList.add('flex');
            friendNameInput.focus();
        }

        function closeCustomizeModal() {
            customizeModal.classList.add('hidden');
            customizeModal.classList.remove('flex');
        }

        function applyCustomNames() {
            const fullFriendName = friendNameInput.value.trim() || 'Doris Huamaní Jordán';
            const firstFriendName = fullFriendName.split(' ')[0] || 'Doris';
            const senderName = senderNameInput.value.trim() || 'Daryl';

            document.querySelectorAll('.friend-fullname-display').forEach(el => {
                el.textContent = fullFriendName;
            });

            document.querySelectorAll('.friend-name-display').forEach(el => {
                el.textContent = firstFriendName;
            });

            document.querySelectorAll('.sender-short-display').forEach(el => {
                el.textContent = senderName;
            });

            document.getElementById('senderNameDisplay').textContent = `${senderName} 💖`;

            closeCustomizeModal();
            soundEngine.playSparkleChime(1.3);
            launchConfetti(window.innerWidth / 2, window.innerHeight / 3, 70);
            showToast(`✨ ¡Sorpresa personalizada para ${fullFriendName} de parte de ${senderName}!`, '🌟');
        }

        document.getElementById('openCustomizeBtn').addEventListener('click', openCustomizeModal);
        document.getElementById('closeCustomizeBtn').addEventListener('click', closeCustomizeModal);
        document.getElementById('cancelCustomizeBtn').addEventListener('click', closeCustomizeModal);
        document.getElementById('saveCustomizeBtn').addEventListener('click', applyCustomNames);

        friendNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyCustomNames();
        });
        senderNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyCustomNames();
        });

        // Botones para reproducir la melodía de cumpleaños directamente
        function playBirthdaySongAction(e) {
            soundEngine.enabled = true;
            document.getElementById('soundIcon').className = 'fa-solid fa-volume-high';
            soundEngine.playHappyBirthdayMelody();
            if (e && e.clientX) {
                launchConfetti(e.clientX, e.clientY, 55);
            }
            showToast('🎵 ¡Reproduciendo melodía de Cumpleaños Feliz para Doris!', '🎂');
        }

        document.getElementById('playMelodyHeaderBtn').addEventListener('click', playBirthdaySongAction);
        document.getElementById('playMelodyNavBtn').addEventListener('click', playBirthdaySongAction);

        // Botón de Lluvia de Confeti del Header
        document.getElementById('instantSparkleBtn').addEventListener('click', (e) => {
            soundEngine.playSparkleChime(1.2);
            launchConfetti(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 3, 95);
            releaseBalloons(8);
            showToast('✨ ¡Lluvia de confeti y dopamina para Doris!', '🎉');
        });

        // Botón de Sonido
        document.getElementById('soundToggleBtn').addEventListener('click', () => {
            soundEngine.enabled = !soundEngine.enabled;
            const icon = document.getElementById('soundIcon');
            if (soundEngine.enabled) {
                icon.className = 'fa-solid fa-volume-high';
                soundEngine.playSparkleChime(1.1);
                showToast('🔊 Efectos de sonido y música activados', '🎵');
            } else {
                icon.className = 'fa-solid fa-volume-xmark text-pink-300';
                showToast('🔇 Sonido silenciado', '✨');
            }
        });

        /**************************************************************
         * 9. TOAST DE NOTIFICACIONES AMIGABLES
         **************************************************************/
        let toastTimeout = null;
        function showToast(message, icon = '✨') {
            const toast = document.getElementById('toastNotification');
            document.getElementById('toastMessage').textContent = message;
            document.getElementById('toastIcon').textContent = icon;

            toast.classList.remove('hidden', 'translate-y-4', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');

            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('translate-y-0', 'opacity-100');
                toast.classList.add('translate-y-4', 'opacity-0');
                setTimeout(() => toast.classList.add('hidden'), 300);
            }, 3400);
        }

        /**************************************************************
         * INICIALIZACIÓN AL CARGAR LA PÁGINA
         **************************************************************/
        window.addEventListener('resize', () => {
            resizeCanvases();
            initStars();
        });

        window.onload = function () {
            resizeCanvases();
            initStars();
            renderNeurotransmitters();
            renderOrbsAndTabs();
            animateCanvases();

            // Pequeña explosión de bienvenida
            setTimeout(() => {
                launchConfetti(window.innerWidth / 2, window.innerHeight * 0.25, 55);
            }, 400);
        };