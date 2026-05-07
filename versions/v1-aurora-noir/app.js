/* ═══════════════════════════════════════════════════════════
   VERSION 1 — "AURORA NOIR"
   Vanilla JS (ES6+), single IIFE, zero npm dependencies.
   Uses GSAP + ScrollTrigger + Lenis (loaded via CDN in index.html).
   Modules:
     - Boot           : loading screen + theme + service worker
     - Cursor         : custom magnetic cursor
     - Aurora         : Canvas 2D ribbon background (auto-degrades)
     - SmoothScroll   : Lenis-based scrolling + nav progress bar
     - Reveal         : split-text reveal + scroll-triggered fades
     - Nav            : sticky navbar + mobile drawer + active section
     - Hero           : parallax portrait + magnetic buttons
     - Skills         : level bar fill on scroll
     - Process        : timeline progress fill on scroll
     - Projects       : filter + tilt + modal
     - Testimonials   : simple carousel
     - Forms          : validation + AJAX (POST → /api/quote, /newsletter)
     - Music          : background music toggle (autoplay-safe)
     - EasterEgg      : Konami code
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ════════════ Utilities ════════════ */
    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    const Toast = {
        container: null,
        init() { this.container = $('#toast-container'); },
        show(message, type = 'success') {
            if (!this.container) return;
            const t = document.createElement('div');
            t.className = `toast ${type}`;
            const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';
            t.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
            this.container.appendChild(t);
            requestAnimationFrame(() => t.classList.add('show'));
            setTimeout(() => {
                t.classList.remove('show');
                setTimeout(() => t.remove(), 400);
            }, 4000);
        }
    };

    /* ════════════ Boot Module ════════════ */
    const Boot = {
        init() {
            this.loadingScreen();
            this.theme();
            this.registerSW();
            this.year();
        },
        loadingScreen() {
            const screen = $('#loading-screen');
            const progress = $('.loader-progress');
            const percent = $('#loader-percent');
            if (!screen) return;
            let p = 0;
            const tick = () => {
                p += Math.random() * 14 + 4;
                if (p > 100) p = 100;
                if (progress) progress.style.width = p + '%';
                if (percent) percent.textContent = String(Math.floor(p)).padStart(2, '0');
                if (p < 100) setTimeout(tick, 90);
                else setTimeout(() => {
                    screen.classList.add('hide');
                    document.body.dispatchEvent(new CustomEvent('app:ready'));
                }, 350);
            };
            window.addEventListener('load', tick);
            // Failsafe
            setTimeout(() => screen.classList.add('hide'), 5000);
        },
        theme() {
            const btn = $('#theme-toggle');
            const icon = btn && btn.querySelector('i');
            const saved = localStorage.getItem('yk-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', saved);
            if (icon) icon.className = saved === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            on(btn, 'click', () => {
                const cur = document.documentElement.getAttribute('data-theme') || 'dark';
                const next = cur === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('yk-theme', next);
                if (icon) icon.className = next === 'light' ? 'fas fa-sun' : 'fas fa-moon';
                document.body.dispatchEvent(new CustomEvent('theme:change', { detail: next }));
            });
        },
        registerSW() {
            if ('serviceWorker' in navigator && location.protocol !== 'file:') {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/static/sw.js').catch(() => {});
                });
            }
        },
        year() {
            const y = new Date().getFullYear();
            $$('.footer-bottom p').forEach(el => {
                if (el.textContent.includes('©')) {
                    el.innerHTML = el.innerHTML.replace(/\d{4}/, y);
                }
            });
        }
    };

    /* ════════════ Cursor Module ════════════ */
    const Cursor = {
        init() {
            if (isTouch) return;
            this.dot = $('#cursor-dot');
            this.outline = $('#cursor-outline');
            if (!this.dot || !this.outline) return;
            this.tx = 0; this.ty = 0;
            this.dx = 0; this.dy = 0;
            this.ox = 0; this.oy = 0;

            on(window, 'mousemove', (e) => { this.tx = e.clientX; this.ty = e.clientY; });
            on(window, 'mouseleave', () => { this.dot.style.opacity = 0; this.outline.style.opacity = 0; });
            on(window, 'mouseenter', () => { this.dot.style.opacity = 1; this.outline.style.opacity = 1; });

            $$('.magnetic-btn, a, button, input, select, textarea').forEach(el => {
                on(el, 'mouseenter', () => document.body.classList.add('cursor-hover'));
                on(el, 'mouseleave', () => document.body.classList.remove('cursor-hover'));
            });

            this.bindMagnetic();
            this.tick();
        },
        bindMagnetic() {
            $$('.magnetic-btn').forEach(btn => {
                let rect;
                on(btn, 'mouseenter', () => { rect = btn.getBoundingClientRect(); });
                on(btn, 'mousemove', (e) => {
                    if (!rect) return;
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const dx = (e.clientX - cx) * 0.25;
                    const dy = (e.clientY - cy) * 0.25;
                    btn.style.transform = `translate(${dx}px, ${dy}px)`;
                });
                on(btn, 'mouseleave', () => { btn.style.transform = ''; });
            });
        },
        tick() {
            this.dx += (this.tx - this.dx) * 0.9;
            this.dy += (this.ty - this.dy) * 0.9;
            this.ox += (this.tx - this.ox) * 0.18;
            this.oy += (this.ty - this.oy) * 0.18;
            if (this.dot)     this.dot.style.transform     = `translate(${this.dx}px, ${this.dy}px) translate(-50%,-50%)`;
            if (this.outline) this.outline.style.transform = `translate(${this.ox}px, ${this.oy}px) translate(-50%,-50%)`;
            requestAnimationFrame(() => this.tick());
        }
    };

    /* ════════════ Aurora Canvas Module ════════════ */
    const Aurora = {
        init() {
            this.canvas = $('#aurora-canvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            // Auto-degrade: low ribbon count on mobile / reduced motion
            this.lowPower = isTouch || window.innerWidth < 768 || reduce;
            this.ribbons = [];
            this.t = 0;
            this.resize();
            this.build();
            on(window, 'resize', () => { this.resize(); this.build(); });
            on(window, 'mousemove', (e) => {
                this.mx = e.clientX / window.innerWidth;
                this.my = e.clientY / window.innerHeight;
            });
            this.mx = 0.5; this.my = 0.5;
            if (!reduce) this.loop();
            else this.draw(); // single static frame
        },
        resize() {
            const w = window.innerWidth, h = window.innerHeight;
            this.w = w; this.h = h;
            this.canvas.width  = Math.floor(w * this.dpr);
            this.canvas.height = Math.floor(h * this.dpr);
            this.canvas.style.width = w + 'px';
            this.canvas.style.height = h + 'px';
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        },
        build() {
            const colors = ['rgba(99,102,241,0.45)','rgba(139,92,246,0.45)','rgba(168,85,247,0.45)','rgba(34,211,238,0.30)','rgba(240,171,252,0.30)'];
            const count = this.lowPower ? 3 : 5;
            this.ribbons = Array.from({length: count}, (_, i) => ({
                color: colors[i % colors.length],
                a: Math.random() * Math.PI * 2,
                speed: 0.0006 + Math.random() * 0.0009,
                amp: 0.18 + Math.random() * 0.18,
                phase: Math.random() * 1000,
                yOff: (i / count) * this.h + Math.random() * 80 - 40
            }));
        },
        draw() {
            const ctx = this.ctx, w = this.w, h = this.h;
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';

            this.ribbons.forEach((r, i) => {
                ctx.beginPath();
                const yBase = r.yOff + (this.my - 0.5) * 60;
                const points = this.lowPower ? 18 : 32;
                for (let p = 0; p <= points; p++) {
                    const x = (p / points) * w;
                    const wave1 = Math.sin((p * 0.4) + (this.t * 0.6) + r.phase) * (r.amp * h * 0.5);
                    const wave2 = Math.cos((p * 0.7) + (this.t * 0.8) + r.phase + i) * (r.amp * h * 0.25);
                    const y = yBase + wave1 + wave2 + Math.sin(this.t * 0.3 + i) * 30;
                    if (p === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.lineWidth = this.lowPower ? 60 : 90;
                ctx.strokeStyle = r.color;
                ctx.shadowBlur = 40;
                ctx.shadowColor = r.color;
                ctx.lineCap = 'round';
                ctx.stroke();
            });
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        },
        loop() {
            this.t += 0.01;
            this.draw();
            requestAnimationFrame(() => this.loop());
        }
    };

    /* ════════════ Smooth Scroll Module ════════════ */
    const SmoothScroll = {
        init() {
            const ProgressFill = $('#nav-progress-fill');
            // Use Lenis if present, else native smooth + manual progress
            if (window.Lenis && !reduce) {
                const lenis = new window.Lenis({
                    duration: 1.15,
                    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                    smoothTouch: false
                });
                this.lenis = lenis;
                const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
                requestAnimationFrame(raf);
                lenis.on('scroll', ({ scroll, limit }) => {
                    if (!ProgressFill) return;
                    const p = limit > 0 ? (scroll / limit) * 100 : 0;
                    ProgressFill.style.width = p + '%';
                });
                if (window.gsap && window.ScrollTrigger) {
                    lenis.on('scroll', window.ScrollTrigger.update);
                    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
                    window.gsap.ticker.lagSmoothing(0);
                }
            } else {
                on(window, 'scroll', () => {
                    if (!ProgressFill) return;
                    const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
                    ProgressFill.style.width = (window.scrollY / max) * 100 + '%';
                }, { passive: true });
            }

            // Anchor scroll
            $$('a[href^="#"]').forEach(a => {
                on(a, 'click', (e) => {
                    const href = a.getAttribute('href');
                    if (!href || href === '#' || href.length < 2) return;
                    const tgt = $(href);
                    if (!tgt) return;
                    e.preventDefault();
                    const off = $('#navbar')?.offsetHeight || 76;
                    const top = tgt.getBoundingClientRect().top + (this.lenis ? this.lenis.scroll : window.scrollY) - off + 4;
                    if (this.lenis) this.lenis.scrollTo(top, { duration: 1.2 });
                    else window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
                    // Close mobile drawer
                    $('#mobile-nav')?.classList.remove('open');
                    $('#nav-toggle')?.classList.remove('open');
                    document.body.classList.remove('no-scroll');
                });
            });
        }
    };

    /* ════════════ Reveal Module ════════════ */
    const Reveal = {
        init() {
            // Split title words for hero
            $$('.split-reveal').forEach(node => {
                const html = node.innerHTML;
                node.innerHTML = html.replace(/(<[^>]+>|[^<\s]+)/g, (m) => {
                    if (m.startsWith('<')) return m;
                    return `<span class="word">${m}</span>`;
                });
            });

            // Hero title-words: trigger after load
            const trigger = () => {
                $$('.title-word').forEach((w, i) => {
                    setTimeout(() => w.classList.add('in'), 100 + i * 90);
                });
                $$('.reveal-fade').forEach((w, i) => {
                    setTimeout(() => w.classList.add('in'), 500 + i * 130);
                });
            };
            on(document.body, 'app:ready', trigger);
            // Failsafe
            setTimeout(trigger, 1500);

            // ScrollTrigger reveals
            if (window.gsap && window.ScrollTrigger && !reduce) {
                window.gsap.registerPlugin(window.ScrollTrigger);

                $$('.split-reveal').forEach(el => {
                    window.ScrollTrigger.create({
                        trigger: el,
                        start: 'top 85%',
                        onEnter: () => el.classList.add('in'),
                    });
                });

                // Generic up-on-enter
                ['.glass-card', '.section-tag', '.section-description'].forEach(sel => {
                    $$(sel).forEach(el => {
                        window.gsap.from(el, {
                            opacity: 0,
                            y: 40,
                            duration: 0.9,
                            ease: 'power3.out',
                            scrollTrigger: { trigger: el, start: 'top 90%' }
                        });
                    });
                });
            } else {
                // Fallback: IntersectionObserver
                const io = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            e.target.classList.add('in');
                            io.unobserve(e.target);
                        }
                    });
                }, { threshold: 0.15 });
                $$('.split-reveal, .glass-card').forEach(el => io.observe(el));
            }
        }
    };

    /* ════════════ Nav Module ════════════ */
    const Nav = {
        init() {
            const navbar = $('#navbar');
            const toggle = $('#nav-toggle');
            const drawer = $('#mobile-nav');

            on(window, 'scroll', () => {
                if (window.scrollY > 12) navbar?.classList.add('scrolled');
                else navbar?.classList.remove('scrolled');
            }, { passive: true });

            on(toggle, 'click', () => {
                toggle.classList.toggle('open');
                drawer?.classList.toggle('open');
                document.body.classList.toggle('no-scroll');
            });

            // Close drawer on outside click
            on(document, 'click', (e) => {
                if (drawer?.classList.contains('open') && !drawer.contains(e.target) && !toggle?.contains(e.target)) {
                    drawer.classList.remove('open');
                    toggle?.classList.remove('open');
                    document.body.classList.remove('no-scroll');
                }
            });

            // Active section highlighter
            const sections = $$('section[id]');
            const links = $$('.nav-link, .bottom-nav-item');
            const setActive = (id) => {
                links.forEach(l => {
                    l.classList.toggle('active', l.dataset.section === id);
                });
            };
            const io = new IntersectionObserver((entries) => {
                entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
            }, { rootMargin: '-40% 0px -55% 0px' });
            sections.forEach(s => io.observe(s));
        }
    };

    /* ════════════ Hero Module ════════════ */
    const Hero = {
        init() {
            const portrait = $('#hero-portrait');
            if (portrait && !isTouch && !reduce) {
                const frame = portrait.querySelector('.hero-portrait-frame');
                on(portrait, 'mousemove', (e) => {
                    const r = portrait.getBoundingClientRect();
                    const x = (e.clientX - r.left) / r.width - 0.5;
                    const y = (e.clientY - r.top) / r.height - 0.5;
                    if (frame) frame.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
                });
                on(portrait, 'mouseleave', () => {
                    if (frame) frame.style.transform = '';
                });
            }

            // Counters
            const counters = $$('.counter');
            const animateCounter = (el) => {
                const target = parseInt(el.dataset.target || '0', 10);
                if (!target) { el.textContent = '0'; return; }
                let cur = 0;
                const step = Math.max(1, Math.floor(target / 60));
                const interval = setInterval(() => {
                    cur += step;
                    if (cur >= target) { cur = target; clearInterval(interval); }
                    el.textContent = cur;
                }, 24);
            };
            const ioc = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) { animateCounter(e.target); ioc.unobserve(e.target); }
                });
            }, { threshold: 0.4 });
            counters.forEach(c => ioc.observe(c));
        }
    };

    /* ════════════ Skills Module ════════════ */
    const Skills = {
        init() {
            const fills = $$('.level-fill');
            const io = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        const lvl = e.target.dataset.level || 0;
                        e.target.style.width = lvl + '%';
                        io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.3 });
            fills.forEach(f => io.observe(f));

            // Card shine
            $$('.skill-card').forEach(card => {
                on(card, 'mousemove', (e) => {
                    const r = card.getBoundingClientRect();
                    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
                    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
                });
            });
        }
    };

    /* ════════════ Process Module ════════════ */
    const Process = {
        init() {
            const fill = $('#timeline-fill');
            const timeline = $('.process-timeline');
            if (!fill || !timeline) return;
            const update = () => {
                const r = timeline.getBoundingClientRect();
                const vh = window.innerHeight;
                const total = r.height + vh;
                const seen = Math.min(Math.max(vh - r.top, 0), total);
                const p = Math.min(100, (seen / total) * 130);
                fill.style.height = p + '%';
            };
            on(window, 'scroll', update, { passive: true });
            on(window, 'resize', update);
            update();
        }
    };

    /* ════════════ Projects Module ════════════ */
    const Projects = {
        init() {
            const filterBtns = $$('.filter-btn');
            const cards = $$('.project-card-new');

            filterBtns.forEach(btn => {
                on(btn, 'click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const f = btn.dataset.filter;
                    cards.forEach(c => {
                        const show = f === 'all' || c.dataset.category === f;
                        c.style.display = show ? '' : 'none';
                        if (show && window.gsap && !reduce) {
                            window.gsap.fromTo(c, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
                        }
                    });
                });
            });

            // Tilt + shine
            cards.forEach(card => {
                on(card, 'mousemove', (e) => {
                    const r = card.getBoundingClientRect();
                    const x = (e.clientX - r.left) / r.width;
                    const y = (e.clientY - r.top) / r.height;
                    card.style.setProperty('--mx', (x * 100) + '%');
                    card.style.setProperty('--my', (y * 100) + '%');
                    if (!isTouch && !reduce) {
                        const inner = card.querySelector('.project-card-inner');
                        if (inner) inner.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 6}deg) rotateX(${-(y - 0.5) * 6}deg)`;
                    }
                });
                on(card, 'mouseleave', () => {
                    const inner = card.querySelector('.project-card-inner');
                    if (inner) inner.style.transform = '';
                });
            });

            // Modal
            const modal = $('#project-modal');
            const closeBtn = $('#modal-close');
            const openModal = (id) => {
                const data = (window.PROJECTS_DATA || {})[id];
                if (!data) return;
                $('#modal-title').textContent = data.title || '';
                $('#modal-description').textContent = data.description || '';
                const tagsHost = $('#modal-tags'); tagsHost.innerHTML = '';
                (Array.isArray(data.tags) ? data.tags : []).forEach(t => {
                    const s = document.createElement('span');
                    s.className = 'tag-new'; s.textContent = t; tagsHost.appendChild(s);
                });
                const fHost = $('#modal-features'); fHost.innerHTML = '';
                (Array.isArray(data.features) ? data.features : []).forEach(f => {
                    const d = document.createElement('div');
                    d.className = 'modal-feature'; d.textContent = f;
                    fHost.appendChild(d);
                });
                const live = $('#modal-link-live');
                const code = $('#modal-link-code');
                if (data.live_url)   { live.href = data.live_url; live.style.display = ''; } else { live.style.display = 'none'; }
                if (data.github_url) { code.href = data.github_url; code.style.display = ''; } else { code.style.display = 'none'; }
                modal?.classList.add('open');
                document.body.classList.add('no-scroll');
            };
            const closeModal = () => {
                modal?.classList.remove('open');
                document.body.classList.remove('no-scroll');
            };
            $$('[data-project]').forEach(b => on(b, 'click', () => openModal(b.dataset.project)));
            $$('.project-card-new').forEach(c => on(c, 'click', (e) => {
                if (e.target.closest('a')) return;
                openModal(c.dataset.projectId);
            }));
            on(closeBtn, 'click', closeModal);
            on($('.modal-overlay'), 'click', closeModal);
            on(document, 'keydown', (e) => { if (e.key === 'Escape') closeModal(); });
        }
    };

    /* ════════════ Testimonials Module ════════════ */
    const Testimonials = {
        init() {
            const cards = $$('.testimonial-card');
            const dots = $$('.carousel-dots .dot');
            const prev = $('.carousel-btn.prev');
            const next = $('.carousel-btn.next');
            if (!cards.length) return;
            let cur = 0;
            const go = (i) => {
                cur = (i + cards.length) % cards.length;
                cards.forEach((c, k) => c.classList.toggle('active', k === cur));
                dots.forEach((d, k) => d.classList.toggle('active', k === cur));
            };
            on(prev, 'click', () => go(cur - 1));
            on(next, 'click', () => go(cur + 1));
            dots.forEach((d, k) => on(d, 'click', () => go(k)));
            // autoplay
            if (!reduce) {
                let timer = setInterval(() => go(cur + 1), 6000);
                const carousel = $('.testimonials-carousel');
                on(carousel, 'mouseenter', () => clearInterval(timer));
                on(carousel, 'mouseleave', () => { timer = setInterval(() => go(cur + 1), 6000); });
            }
        }
    };

    /* ════════════ Forms Module ════════════ */
    const Forms = {
        init() {
            this.bindQuote();
            this.bindNewsletter();
        },
        clearError(group) {
            group.classList.remove('error');
            const m = group.querySelector('.error-message'); if (m) m.textContent = '';
        },
        setError(group, msg) {
            group.classList.add('error');
            const m = group.querySelector('.error-message'); if (m) m.textContent = msg;
        },
        async post(url, body) {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return res.json().catch(() => ({ success: false, message: 'Bad response' }));
        },
        bindQuote() {
            const form = $('#quote-form');
            if (!form) return;
            on(form, 'submit', async (e) => {
                e.preventDefault();
                const fields = ['name','email','service','budget','timeline','message'];
                const data = {};
                let ok = true;
                fields.forEach(f => {
                    const el = form.querySelector(`[name="${f}"]`);
                    const grp = el.closest('.form-group');
                    this.clearError(grp);
                    const v = (el.value || '').trim();
                    data[f] = v;
                    if (!v) { this.setError(grp, 'Required'); ok = false; }
                    else if (f === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
                        this.setError(grp, 'Invalid email'); ok = false;
                    }
                });
                if (!ok) return;
                const btn = form.querySelector('button[type="submit"]');
                const originalHTML = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending...</span>';
                const r = await this.post('/api/quote', data);
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                if (r.success) { Toast.show(r.message, 'success'); form.reset(); }
                else Toast.show(r.message || 'Error', 'error');
            });
        },
        bindNewsletter() {
            const form = $('#newsletter-form');
            if (!form) return;
            on(form, 'submit', async (e) => {
                e.preventDefault();
                const input = form.querySelector('input[type="email"]');
                const email = (input.value || '').trim();
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    Toast.show('Please enter a valid email', 'error');
                    return;
                }
                const btn = form.querySelector('button[type="submit"]');
                const original = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                const r = await this.post('/api/newsletter', { email });
                btn.disabled = false;
                btn.innerHTML = original;
                if (r.success) { Toast.show(r.message, 'success'); form.reset(); }
                else Toast.show(r.message || 'Error', 'error');
            });
        }
    };

    /* ════════════ Music Module ════════════ */
    const Music = {
        init() {
            const audio = $('#background-music');
            const btn = $('#music-toggle');
            const player = $('#music-player');
            const icon = $('#music-icon');
            if (!audio || !btn) return;
            audio.volume = 0.35;
            let playing = false;
            const setIcon = () => {
                if (icon) icon.className = playing ? 'fas fa-volume-up' : 'fas fa-volume-mute';
                player?.classList.toggle('playing', playing);
            };
            on(btn, 'click', async () => {
                if (playing) { audio.pause(); playing = false; }
                else {
                    try { await audio.play(); playing = true; } catch (_) { playing = false; }
                }
                setIcon();
            });
            setIcon();
        }
    };

    /* ════════════ Easter Egg Module ════════════ */
    const EasterEgg = {
        init() {
            const overlay = $('#easter-egg');
            const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
            let pos = 0;
            on(window, 'keydown', (e) => {
                const k = e.key;
                if (k === seq[pos]) {
                    pos++;
                    if (pos === seq.length) { overlay?.classList.add('show'); pos = 0; }
                } else { pos = 0; }
            });
            window.closeEasterEgg = () => overlay?.classList.remove('show');
        }
    };

    /* ════════════ App Bootstrap ════════════ */
    const App = {
        init() {
            Toast.init();
            Boot.init();
            Cursor.init();
            Aurora.init();
            Reveal.init();
            Nav.init();
            Hero.init();
            Skills.init();
            Process.init();
            Projects.init();
            Testimonials.init();
            Forms.init();
            Music.init();
            EasterEgg.init();
            // Defer Lenis-bound smooth scroll until libs ready (script defer)
            const startSmooth = () => SmoothScroll.init();
            if (document.readyState === 'complete') startSmooth();
            else window.addEventListener('load', startSmooth);
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init());
    else App.init();

})();
