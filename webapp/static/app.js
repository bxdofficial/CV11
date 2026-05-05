/**
 * ==========================================
 * YOUSSEF KHAMIS AL-ASSIUTY PORTFOLIO
 * Interactive JavaScript - Full Upgrade v2.0
 * ==========================================
 */

(function() {
    'use strict';

    // ==========================================
    // CONFIGURATION
    // ==========================================
    // Project data is now loaded from server-side via window.PROJECTS_DATA
    const CONFIG = {
        projects: window.PROJECTS_DATA || {}
    };

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const elements = {
        loadingScreen: document.getElementById('loading-screen'),
        cursorDot: document.getElementById('cursor-dot'),
        cursorOutline: document.getElementById('cursor-outline'),
        navbar: document.getElementById('navbar'),
        navToggle: document.getElementById('nav-toggle'),
        mobileNav: document.getElementById('mobile-nav'),
        themeToggle: document.getElementById('theme-toggle'),
        particlesCanvas: document.getElementById('particles-canvas'),
        quoteForm: document.getElementById('quote-form'),
        newsletterForm: document.getElementById('newsletter-form'),
        toastContainer: document.getElementById('toast-container'),
        easterEgg: document.getElementById('easter-egg'),
        bottomNav: document.getElementById('bottom-nav'),
        testimonialsContainer: document.getElementById('testimonials-container'),
    };

    // ==========================================
    // LOADING SCREEN
    // ==========================================
    function initLoadingScreen() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (elements.loadingScreen) {
                    elements.loadingScreen.classList.add('hidden');
                }
                document.body.style.overflow = 'visible';
                initAnimationsOnLoad();
            }, 1500);
        });
    }

    // ==========================================
    // CUSTOM CURSOR
    // ==========================================
    function initCustomCursor() {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        if (!elements.cursorDot || !elements.cursorOutline) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            
            cursorX += dx * 0.15;
            cursorY += dy * 0.15;

            elements.cursorDot.style.left = `${mouseX}px`;
            elements.cursorDot.style.top = `${mouseY}px`;
            elements.cursorOutline.style.left = `${cursorX}px`;
            elements.cursorOutline.style.top = `${cursorY}px`;

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Enhanced Hover effects for different elements
        const hoverElements = document.querySelectorAll('a, button, [role="button"], .magnetic-btn');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                elements.cursorOutline.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                elements.cursorOutline.classList.remove('hover');
            });
        });

        // Text input cursor
        const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
        textInputs.forEach(el => {
            el.addEventListener('mouseenter', () => {
                elements.cursorOutline.classList.add('cursor-text');
            });
            el.addEventListener('mouseleave', () => {
                elements.cursorOutline.classList.remove('cursor-text');
            });
        });

        // Project cards - show "VIEW" cursor
        const projectCards = document.querySelectorAll('.project-card-new, .project-image-new');
        projectCards.forEach(el => {
            el.addEventListener('mouseenter', () => {
                elements.cursorOutline.classList.add('cursor-view');
            });
            el.addEventListener('mouseleave', () => {
                elements.cursorOutline.classList.remove('cursor-view');
            });
        });

        // Carousel/Draggable elements
        const draggables = document.querySelectorAll('.carousel-container, .testimonials-carousel');
        draggables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                elements.cursorOutline.classList.add('cursor-grab');
            });
            el.addEventListener('mouseleave', () => {
                elements.cursorOutline.classList.remove('cursor-grab');
            });
        });

        // Social media cards - pointer effect
        const socialCards = document.querySelectorAll('.social-media-card');
        socialCards.forEach(el => {
            el.addEventListener('mouseenter', () => {
                elements.cursorOutline.classList.add('cursor-pointer');
            });
            el.addEventListener('mouseleave', () => {
                elements.cursorOutline.classList.remove('cursor-pointer');
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            elements.cursorOutline.classList.add('cursor-hidden');
            elements.cursorDot.classList.add('cursor-hidden');
        });
        document.addEventListener('mouseenter', () => {
            elements.cursorOutline.classList.remove('cursor-hidden');
            elements.cursorDot.classList.remove('cursor-hidden');
        });

        // Click effects
        document.addEventListener('mousedown', () => {
            elements.cursorOutline.classList.add('click');
            elements.cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
        });
        document.addEventListener('mouseup', () => {
            elements.cursorOutline.classList.remove('click');
            elements.cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    // ==========================================
    // MAGNETIC BUTTONS
    // ==========================================
    function initMagneticButtons() {
        const magneticBtns = document.querySelectorAll('.magnetic-btn');
        
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ==========================================
    // NAVBAR
    // ==========================================
    function initNavbar() {
        // Scroll effect
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                elements.navbar?.classList.add('scrolled');
            } else {
                elements.navbar?.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });

        // Mobile menu toggle
        elements.navToggle?.addEventListener('click', () => {
            elements.navToggle.classList.toggle('active');
            elements.mobileNav?.classList.toggle('active');
            document.body.style.overflow = elements.mobileNav?.classList.contains('active') ? 'hidden' : 'visible';
        });

        // Close mobile menu on link click
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                elements.navToggle?.classList.remove('active');
                elements.mobileNav?.classList.remove('active');
                document.body.style.overflow = 'visible';
            });
        });

        // Active nav link on scroll
        const sections = document.querySelectorAll('section[id]');
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            
            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');
                    
                    // Update bottom nav
                    document.querySelectorAll('.bottom-nav-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    document.querySelector(`.bottom-nav-item[data-section="${sectionId}"]`)?.classList.add('active');
                }
            });
        });
    }

    // ==========================================
    // THEME TOGGLE
    // ==========================================
    function initThemeToggle() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeIcon('dark');
        }

        elements.themeToggle?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        const icon = elements.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ==========================================
    // PARTICLES ANIMATION
    // ==========================================
    function initParticles() {
        const canvas = elements.particlesCanvas;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function init() {
            particles = [];
            const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            particles.forEach((a, indexA) => {
                particles.slice(indexA + 1).forEach(b => {
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                });
            });

            animationId = requestAnimationFrame(animate);
        }

        init();
        animate();

        // Pause animation when not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });
    }

    // ==========================================
    // COUNTER ANIMATION
    // ==========================================
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    animateCounter(counter, target);
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(counter => observer.observe(counter));
    }

    function animateCounter(element, target) {
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // ==========================================
    // SKILL LEVEL ANIMATION - FIXED
    // ==========================================
    function initSkillAnimations() {
        const skillCards = document.querySelectorAll('.skill-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Animate the level fill
                    const levelFill = entry.target.querySelector('.level-fill');
                    if (levelFill) {
                        const level = levelFill.getAttribute('data-level');
                        if (level) {
                            levelFill.style.setProperty('--skill-level', level + '%');
                            // Trigger animation
                            setTimeout(() => {
                                levelFill.style.width = level + '%';
                            }, 100);
                        }
                    }
                }
            });
        }, { threshold: 0.3 });

        skillCards.forEach(card => {
            // Ensure icons stay visible
            const icon = card.querySelector('.skill-icon');
            if (icon) {
                icon.style.opacity = '1';
                icon.style.visibility = 'visible';
            }
            observer.observe(card);
        });
    }

    // Old project filters function removed - replaced with initProjectFiltersNew()

    // ==========================================
    // NEW PROJECT CARDS WITH 3D TILT & MODAL
    // ==========================================
    function initProjectCards() {
        const projectCards = document.querySelectorAll('.project-card-new');
        const modal = document.getElementById('project-modal');
        const modalClose = document.getElementById('modal-close');
        const modalOverlay = document.querySelector('.modal-overlay');
        
        // 3D Tilt Effect on Cards
        projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 15;
                const rotateY = (centerX - x) / 15;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                
                // Move shine effect
                const shine = card.querySelector('.project-card-shine');
                if (shine) {
                    const shineX = (x / rect.width) * 100 - 50;
                    const shineY = (y / rect.height) * 100 - 50;
                    shine.style.transform = `translate(${shineX}%, ${shineY}%) rotate(45deg)`;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
        
        // View Project Button - Open Modal
        const viewBtns = document.querySelectorAll('.view-project-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const projectId = btn.getAttribute('data-project');
                openProjectModal(projectId);
            });
        });
        
        // Close Modal
        function closeModal() {
            modal?.classList.remove('active');
            document.body.style.overflow = 'visible';
        }
        
        modalClose?.addEventListener('click', closeModal);
        modalOverlay?.addEventListener('click', closeModal);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Open Modal Function
        function openProjectModal(projectId) {
            const project = CONFIG.projects[projectId];
            if (!project || !modal) return;
            
            // Update modal content
            const titleEl = document.getElementById('modal-title');
            const tagsEl = document.getElementById('modal-tags');
            const descEl = document.getElementById('modal-description');
            const featuresEl = document.getElementById('modal-features');
            const liveLink = document.getElementById('modal-link-live');
            const codeLink = document.getElementById('modal-link-code');
            
            if (titleEl) titleEl.textContent = project.title;
            if (descEl) descEl.textContent = project.description;
            
            // Update tags
            if (tagsEl) {
                tagsEl.innerHTML = project.tags.map(tag => 
                    `<span class="tag-new">${tag}</span>`
                ).join('');
            }
            
            // Update features
            if (featuresEl && project.features && project.features.length > 0) {
                featuresEl.innerHTML = `
                    <h4><i class="fas fa-star"></i> Key Features</h4>
                    <ul>
                        ${project.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
                    </ul>
                `;
            }
            
            // Update action links
            if (liveLink) {
                if (project.live_url) {
                    liveLink.href = project.live_url;
                    liveLink.style.display = 'inline-flex';
                } else {
                    liveLink.style.display = 'none';
                }
            }
            if (codeLink) {
                if (project.github_url) {
                    codeLink.href = project.github_url;
                    codeLink.style.display = 'inline-flex';
                } else {
                    codeLink.style.display = 'none';
                }
            }
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // ==========================================
    // PROJECT FILTERS (Updated)
    // ==========================================
    function initProjectFiltersNew() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card-new');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                // Filter projects
                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ==========================================
    // INTERACTIVE ABOUT IMAGE
    // ==========================================
    function initInteractiveAboutImage() {
        const imageWrapper = document.getElementById('about-image-wrapper');
        if (!imageWrapper) return;
        
        imageWrapper.addEventListener('mousemove', (e) => {
            const rect = imageWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            imageWrapper.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        imageWrapper.addEventListener('mouseleave', () => {
            imageWrapper.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    }

    // ==========================================
    // TESTIMONIALS CAROUSEL
    // ==========================================
    function initTestimonialsCarousel() {
        const container = elements.testimonialsContainer;
        if (!container) return;

        const cards = container.querySelectorAll('.testimonial-card');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        let currentIndex = 0;
        let autoRotateInterval;

        function showCard(index) {
            cards.forEach((card, i) => {
                card.classList.remove('active');
                dots[i]?.classList.remove('active');
            });
            
            cards[index]?.classList.add('active');
            dots[index]?.classList.add('active');
        }

        function startAutoRotate() {
            autoRotateInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % cards.length;
                showCard(currentIndex);
            }, 5000);
        }

        function stopAutoRotate() {
            clearInterval(autoRotateInterval);
        }

        prevBtn?.addEventListener('click', () => {
            stopAutoRotate();
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
            showCard(currentIndex);
            startAutoRotate();
        });

        nextBtn?.addEventListener('click', () => {
            stopAutoRotate();
            currentIndex = (currentIndex + 1) % cards.length;
            showCard(currentIndex);
            startAutoRotate();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopAutoRotate();
                currentIndex = index;
                showCard(currentIndex);
                startAutoRotate();
            });
        });

        startAutoRotate();
    }

    // ==========================================
    // FORM HANDLING
    // ==========================================
    function initForms() {
        // Quote Form
        const quoteForm = elements.quoteForm;
        if (quoteForm) {
            quoteForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (!validateForm(quoteForm)) return;

                const submitBtn = quoteForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;

                const formData = new FormData(quoteForm);
                const data = Object.fromEntries(formData.entries());

                try {
                    const response = await fetch('/api/quote', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    if (result.success) {
                        showToast(result.message, 'success');
                        quoteForm.reset();
                    } else {
                        showToast(result.message || 'Something went wrong', 'error');
                    }
                } catch (error) {
                    showToast('Failed to send request. Please try again.', 'error');
                }

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        }

        // Newsletter Form
        const newsletterForm = elements.newsletterForm;
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailInput = newsletterForm.querySelector('input[type="email"]');
                const email = emailInput.value;

                if (!email || !isValidEmail(email)) {
                    showToast('Please enter a valid email address', 'error');
                    return;
                }

                const submitBtn = newsletterForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                submitBtn.disabled = true;

                try {
                    const response = await fetch('/api/newsletter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    const result = await response.json();

                    if (result.success) {
                        showToast(result.message, 'success');
                        newsletterForm.reset();
                    } else {
                        showToast(result.message || 'Something went wrong', 'error');
                    }
                } catch (error) {
                    showToast('Failed to subscribe. Please try again.', 'error');
                }

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        }
    }

    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            const errorMessage = formGroup?.querySelector('.error-message');

            if (!field.value.trim()) {
                formGroup?.classList.add('error');
                if (errorMessage) errorMessage.textContent = 'This field is required';
                isValid = false;
            } else if (field.type === 'email' && !isValidEmail(field.value)) {
                formGroup?.classList.add('error');
                if (errorMessage) errorMessage.textContent = 'Please enter a valid email';
                isValid = false;
            } else {
                formGroup?.classList.remove('error');
            }
        });

        return isValid;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    function showToast(message, type = 'success') {
        const iconMap = {
            success: 'check',
            error: 'exclamation',
            info: 'info'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${iconMap[type] || 'info'}"></i>
            </div>
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;

        elements.toastContainer?.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn?.addEventListener('click', () => removeToast(toast));

        setTimeout(() => removeToast(toast), 5000);
    }

    function removeToast(toast) {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Social links are now handled server-side in templates
    function initSocialLinks() {}

    // CV links are now real URLs in the template
    function initCVDownload() {}

    // Calendly is now a real link in the template
    function initCalendly() {}

    // ==========================================
    // EASTER EGG - KONAMI CODE
    // ==========================================
    function initEasterEgg() {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    triggerEasterEgg();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }

    function triggerEasterEgg() {
        elements.easterEgg?.classList.add('active');
        
        // Add confetti effect
        createConfetti();
    }

    window.closeEasterEgg = function() {
        elements.easterEgg?.classList.remove('active');
    };

    function createConfetti() {
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#eab308'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                z-index: 10001;
                animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }

        // Add confetti animation style
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    to {
                        top: 100vh;
                        transform: rotate(720deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ==========================================
    // SMOOTH SCROLL
    // ==========================================
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ==========================================
    // SCROLL ANIMATIONS
    // ==========================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.section-header, .about-grid, .project-card-container, .process-step, .testimonial-card, .blog-card, .contact-grid');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ==========================================
    // MORPHING TEXT
    // ==========================================
    function initMorphingText() {
        const texts = ['Youssef Khamis', 'Frontend Dev', 'Web Builder'];
        let currentIndex = 0;
        const morphingText = document.getElementById('morphing-name');
        
        if (!morphingText) return;

        setInterval(() => {
            morphingText.style.opacity = '0';
            morphingText.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % texts.length;
                morphingText.textContent = texts[currentIndex];
                morphingText.style.opacity = '1';
                morphingText.style.transform = 'translateY(0)';
            }, 300);
        }, 3000);

        morphingText.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }

    // ==========================================
    // ANIMATIONS ON LOAD
    // ==========================================
    function initAnimationsOnLoad() {
        // Trigger title animations
        document.querySelectorAll('.title-word').forEach(word => {
            word.style.animationPlayState = 'running';
        });
    }

    // ==========================================
    // TOUCH GESTURES FOR MOBILE
    // ==========================================
    function initTouchGestures() {
        let touchStartX = 0;
        let touchEndX = 0;

        const sections = ['home', 'about', 'skills', 'projects', 'process', 'testimonials', 'blog', 'contact'];
        let currentSectionIndex = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 100;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                // Determine current section
                const scrollPosition = window.scrollY;
                sections.forEach((section, index) => {
                    const el = document.getElementById(section);
                    if (el && scrollPosition >= el.offsetTop - 100) {
                        currentSectionIndex = index;
                    }
                });

                if (diff > 0 && currentSectionIndex < sections.length - 1) {
                    // Swipe left - go to next section
                    const nextSection = document.getElementById(sections[currentSectionIndex + 1]);
                    nextSection?.scrollIntoView({ behavior: 'smooth' });
                } else if (diff < 0 && currentSectionIndex > 0) {
                    // Swipe right - go to previous section
                    const prevSection = document.getElementById(sections[currentSectionIndex - 1]);
                    prevSection?.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }

    // ==========================================
    // PROFILE IMAGE VERIFICATION
    // ==========================================
    function verifyProfileImages() {
        const profileImages = document.querySelectorAll('.profile-img, .about-profile-img, .nav-profile-img, .mobile-profile-img');
        
        profileImages.forEach(img => {
            // Ensure image is visible
            img.style.display = 'block';
            img.style.visibility = 'visible';
            img.style.opacity = '1';
            
            // Handle load errors
            img.onerror = function() {
                // Fallback to a gradient placeholder
                this.style.display = 'none';
                const parent = this.parentElement;
                if (parent) {
                    parent.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)';
                }
            };
        });
    }

    // ==========================================
    // INITIALIZE ALL
    // ==========================================
    function init() {
        initLoadingScreen();
        initCustomCursor();
        initMagneticButtons();
        initNavbar();
        initThemeToggle();
        initParticles();
        initCounters();
        initSkillAnimations();
        initProjectFiltersNew();
        initProjectCards();
        initInteractiveAboutImage();
        initTestimonialsCarousel();
        initForms();
        initSocialLinks();
        initCVDownload();
        initCalendly();
        initEasterEgg();
        initSmoothScroll();
        initScrollAnimations();
        initMorphingText();
        initTouchGestures();
        verifyProfileImages();
        initMusicPlayer();
        initScrollProgress();
        initScrollReveal();
        initRippleEffect();
        initTypingEffect();
        initParallaxEffect();
        initServiceWorker();
        initAutoTheme();
        initLazyImages();
        initEnhancedForms();
        initModalCursorFix();
    }

    // ==========================================
    // MUSIC PLAYER
    // ==========================================
    function initMusicPlayer() {
        const musicBtn = document.getElementById('music-toggle');
        const musicIcon = document.getElementById('music-icon');
        const backgroundMusic = document.getElementById('background-music');
        
        if (!musicBtn || !backgroundMusic) return;
        
        // Set initial volume to 50%
        backgroundMusic.volume = 0.5;
        
        let isPlaying = false;
        let hasUserInteracted = false;
        
        // Function to toggle music
        function toggleMusic() {
            if (isPlaying) {
                backgroundMusic.pause();
                musicBtn.classList.remove('playing');
                musicIcon.className = 'fas fa-volume-up';
                isPlaying = false;
            } else {
                backgroundMusic.play().then(() => {
                    musicBtn.classList.add('playing');
                    musicIcon.className = 'fas fa-pause';
                    isPlaying = true;
                    hasUserInteracted = true;
                }).catch(err => {
                    console.log('Audio play prevented:', err);
                });
            }
        }
        
        // Click handler
        musicBtn.addEventListener('click', toggleMusic);
        
        // Try to autoplay after first user interaction
        function tryAutoplay() {
            if (!hasUserInteracted) {
                backgroundMusic.play().then(() => {
                    musicBtn.classList.add('playing');
                    musicIcon.className = 'fas fa-pause';
                    isPlaying = true;
                    hasUserInteracted = true;
                }).catch(() => {
                    // Autoplay was prevented, wait for user interaction
                });
            }
            document.removeEventListener('click', tryAutoplay);
            document.removeEventListener('scroll', tryAutoplay);
            document.removeEventListener('keydown', tryAutoplay);
        }
        
        // Listen for any user interaction to try autoplay
        document.addEventListener('click', tryAutoplay, { once: true });
        document.addEventListener('scroll', tryAutoplay, { once: true });
        document.addEventListener('keydown', tryAutoplay, { once: true });
        
        // Show toast notification about music
        setTimeout(() => {
            if (!isPlaying) {
                showToast('🎵 Click the music button to play background music!', 'info');
            }
        }, 3000);
    }

    // ==========================================
    // SCROLL PROGRESS INDICATOR
    // ==========================================
    function initScrollProgress() {
        // Create scroll progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.prepend(progressBar);
        
        function updateProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = scrollTop / docHeight;
            progressBar.style.transform = `scaleX(${scrollPercent})`;
        }
        
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    // ==========================================
    // SCROLL REVEAL ANIMATIONS
    // ==========================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.section-header, .about-grid, .skills-container, .projects-grid-new, .contact-grid, .social-media-grid');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal', 'active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
        
        // Stagger animation for cards
        const cards = document.querySelectorAll('.skill-card, .project-card-new, .social-media-card, .info-card');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
        });
    }

    // ==========================================
    // RIPPLE EFFECT
    // ==========================================
    function initRippleEffect() {
        const buttons = document.querySelectorAll('.btn, .music-btn');
        
        buttons.forEach(btn => {
            btn.classList.add('ripple');
            
            btn.addEventListener('click', function(e) {
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                btn.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ==========================================
    // TYPING EFFECT
    // ==========================================
    function initTypingEffect() {
        const heroTitle = document.querySelector('.hero-title .title-word[data-text]');
        if (!heroTitle) return;
        
        const text = heroTitle.getAttribute('data-text');
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '3px solid var(--accent-primary)';
        
        let index = 0;
        function type() {
            if (index < text.length) {
                heroTitle.textContent += text.charAt(index);
                index++;
                setTimeout(type, 100);
            } else {
                // Blink cursor for a while then stop
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 3000);
            }
        }
        
        // Start typing after loading screen
        setTimeout(type, 1500);
    }

    // ==========================================
    // PARALLAX EFFECT
    // ==========================================
    function initParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.gradient-orb');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            parallaxElements.forEach((el, index) => {
                const speed = 0.5 + (index * 0.1);
                el.style.transform = `translateY(${scrollY * speed}px)`;
            });
        }, { passive: true });
        
        // Mouse parallax for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mousemove', (e) => {
                const rect = hero.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                
                parallaxElements.forEach((el, index) => {
                    const depth = 20 + (index * 10);
                    el.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
                });
            });
        }
    }

    // ==========================================
    // SERVICE WORKER REGISTRATION
    // ==========================================
    function initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/static/sw.js')
                    .then((registration) => {
                        console.log('[App] Service Worker registered:', registration.scope);
                    })
                    .catch((error) => {
                        console.log('[App] Service Worker registration failed:', error);
                    });
            });
        }
    }

    // ==========================================
    // AUTO DARK/LIGHT MODE
    // ==========================================
    function initAutoTheme() {
        const savedTheme = localStorage.getItem('theme');
        
        // If no saved preference, use system preference
        if (!savedTheme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
            
            if (prefersDark.matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
                updateThemeIcon(true);
            }
            
            // Listen for system theme changes
            prefersDark.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                    updateThemeIcon(e.matches);
                }
            });
        }
    }

    function updateThemeIcon(isDark) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // ==========================================
    // IMAGE LAZY LOADING WITH SKELETON
    // ==========================================
    function initLazyImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const wrapper = img.closest('.img-wrapper');
                    
                    // Add loading class
                    img.classList.add('img-loading');
                    
                    // Load the image
                    img.src = img.dataset.src;
                    
                    img.onload = () => {
                        img.classList.remove('img-loading');
                        img.classList.add('img-loaded');
                        if (wrapper) {
                            wrapper.classList.add('loaded');
                        }
                    };
                    
                    img.onerror = () => {
                        img.classList.add('img-error');
                    };
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // ==========================================
    // ENHANCED FORM VALIDATION
    // ==========================================
    function initEnhancedForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Real-time validation
                input.addEventListener('blur', () => validateField(input));
                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        validateField(input);
                    }
                });
            });
        });
    }

    function validateField(field) {
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup?.querySelector('.error-message');
        let isValid = true;
        let message = '';

        // Required check
        if (field.required && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        }
        
        // Email validation
        else if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        
        // Min length check
        else if (field.minLength && field.value.length < field.minLength) {
            isValid = false;
            message = `Minimum ${field.minLength} characters required`;
        }

        // Update UI
        if (formGroup) {
            formGroup.classList.toggle('error', !isValid);
            field.classList.toggle('error', !isValid);
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }

        return isValid;
    }

    // ==========================================
    // CURSOR FIX FOR MODALS
    // ==========================================
    function initModalCursorFix() {
        const modal = document.getElementById('project-modal');
        if (!modal) return;

        // Fix: ensure modal buttons and links have proper cursor
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (modal.classList.contains('active')) {
                        if (elements.cursorOutline) elements.cursorOutline.style.zIndex = '100001';
                        if (elements.cursorDot) elements.cursorDot.style.zIndex = '100002';
                        // Force pointer cursor on modal interactive elements
                        modal.querySelectorAll('a, button, .btn').forEach(el => {
                            el.style.cursor = 'pointer';
                        });
                    } else {
                        if (elements.cursorOutline) elements.cursorOutline.style.zIndex = '';
                        if (elements.cursorDot) elements.cursorDot.style.zIndex = '';
                    }
                }
            });
        });

        observer.observe(modal, { attributes: true });
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
