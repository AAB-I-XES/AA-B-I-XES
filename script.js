// 1. LENIS SMOOTH SCROLL IMPLEMENTATION
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Force GSAP ScrollTrigger to tie into Lenis
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0, 0);

// 2. CANVAS FRAME ENGINE (Preserved for Video/Hero bg)
const canvas = document.getElementById('frame-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
let frames1 = [];
const config = { frameCount1: 300, loadedFrames: 0, isMobile: window.innerWidth <= 768 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    config.isMobile = window.innerWidth <= 768;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const frameFormat1 = (index) => `FRAMES/Camera_movement_between_images_3a27ec4093 (online-video-cutter.com)_${index.toString().padStart(3, '0')}.webp`;

async function preloadFrames() {
    for (let i = 0; i < config.frameCount1; i++) {
        const img = new Image();
        img.src = frameFormat1(i);
        frames1[i] = img;
        img.onload = () => { config.loadedFrames++; };
    }
}
// Un-comment to actually load frames if needed: preloadFrames();

function renderFrame(seq, index) {
    // Basic render assuming frames1 is loaded
    if (frames1[index] && frames1[index].complete) {
        const img = frames1[index];
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        if (canvasRatio > imgRatio) { drawWidth = canvas.width; drawHeight = canvas.width / imgRatio; offsetY = (canvas.height - drawHeight) / 2; }
        else { drawHeight = canvas.height; drawWidth = canvas.height * imgRatio; offsetX = (canvas.width - drawWidth) / 2; }
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// 3. SCROLL PROGRESS INDICATOR
const progressBar = document.getElementById('scroll-progress-fill');
lenis.on('scroll', (e) => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    if (progressBar) progressBar.style.width = `${scrollPercent}%`;
    updateActiveNav(scrollTop);
});

// 4. DYNAMIC NAVIGATION
function updateActiveNav(scrollY) {
    const sections = ['home', 'about', 'features', 'services', 'showcase', 'process', 'stats', 'testimonials', 'demo', 'contact'];
    let current = 'home';
    const offsetThreshold = window.innerHeight / 3;

    sections.forEach(sec => {
        const el = document.getElementById(sec);
        if (el) {
            const sectionTop = el.offsetTop;
            if (scrollY >= sectionTop - offsetThreshold) {
                current = sec;
            }
        }
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
}

document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href');
        lenis.scrollTo(target, { offset: -50, duration: 1.5 });
    });
});
// 5. HERO-TO-ABOUT BEND TRANSITION (Real-time scroll-driven on #about)
const aboutSection = document.getElementById('about');
if (aboutSection) {
    // Use wider ellipse values on mobile to prevent text clipping
    const isMobileView = window.innerWidth <= 768;
    const endClip = isMobileView
        ? 'ellipse(95% 92% at 50% 100%)'   // gentler curve for mobile
        : 'ellipse(75% 85% at 50% 100%)';  // dramatic curve for desktop

    gsap.fromTo(aboutSection,
        { clipPath: 'ellipse(100% 100% at 50% 100%)' },
        {
            clipPath: endClip,
            ease: "none",
            scrollTrigger: {
                trigger: aboutSection,
                start: 'top bottom',
                end: 'top 30%',
                scrub: 0.5,
            }
        }
    );

    // Re-create the animation on resize so the correct ellipse is used
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const nowMobile = window.innerWidth <= 768;
            const newClip = nowMobile
                ? 'ellipse(95% 92% at 50% 100%)'
                : 'ellipse(75% 85% at 50% 100%)';
            gsap.set(aboutSection, { clipPath: newClip });
        }, 250);
    });

    // 5.5 ABOUT SECTION CARD DECK SPREAD
    const aboutDeck = document.querySelector('.about-deck-container');
    const deckCards = document.querySelectorAll('.about-deck-container .about-card');

    if (aboutDeck && deckCards.length >= 3) {
        const isMobileDeck = window.innerWidth <= 768;

        if (isMobileDeck) {
            // Mobile: Revolve auto-play carousel
            const pos = [
                { y: 0, opacity: 1, rotationZ: 0, scale: 1 },
                { y: 30, opacity: 0.8, rotationZ: 2, scale: 0.95 },
                { y: 60, opacity: 0.6, rotationZ: -2, scale: 0.9 }
            ];

            deckCards.forEach((card, i) => {
                gsap.set(card, { ...pos[i], zIndex: 3 - i });
            });

            let mobileTl = gsap.timeline({
                repeat: -1,
                scrollTrigger: {
                    trigger: aboutDeck,
                    start: "top bottom",
                    end: "bottom top",
                    toggleActions: "play pause resume pause"
                }
            });

            for (let i = 0; i < 3; i++) {
                let f = i % 3;
                let m = (i + 1) % 3;
                let b = (i + 2) % 3;

                // 2s pause before each transition
                mobileTl.to(deckCards[f], {
                    y: -120, opacity: 0, scale: 1.05,
                    duration: 0.5, ease: "power2.in"
                }, "+=2");

                // Shift middle and back forwards
                mobileTl.to(deckCards[m], {
                    y: pos[0].y, opacity: pos[0].opacity, rotationZ: pos[0].rotationZ, scale: pos[0].scale, zIndex: 3,
                    duration: 0.6, ease: "power2.out"
                }, "<0.2");

                mobileTl.to(deckCards[b], {
                    y: pos[1].y, opacity: pos[1].opacity, rotationZ: pos[1].rotationZ, scale: pos[1].scale, zIndex: 2,
                    duration: 0.6, ease: "power2.out"
                }, "<");

                // Move front back to bottom invisibly then slide into back position
                mobileTl.set(deckCards[f], { zIndex: 1 });
                mobileTl.fromTo(deckCards[f],
                    { y: pos[2].y + 40, opacity: 0, scale: 0.85 },
                    { y: pos[2].y, opacity: pos[2].opacity, rotationZ: pos[2].rotationZ, scale: pos[2].scale, duration: 0.5, ease: "power2.out" },
                    "-=0.2"
                );
            }
        } else {
            // Desktop: Horizontal spread on scroll
            let deckTl = gsap.timeline({
                scrollTrigger: {
                    trigger: aboutSection,
                    start: "top top",
                    end: "+=1500", // pin for 1500px of scroll
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1
                }
            });

            gsap.set(deckCards[0], { rotationZ: 1 });
            gsap.set(deckCards[1], { rotationZ: 1 });
            gsap.set(deckCards[2], { rotationZ: -1 });

            // Horizontal spread for desktop
            deckTl.to(deckCards[0], { x: -350, rotationZ: -5, y: 20, duration: 1 }, 0)
                .to(deckCards[1], { x: 0, rotationZ: 0, y: -20, duration: 1 }, 0)
                .to(deckCards[2], { x: 350, rotationZ: 5, y: 20, duration: 1 }, 0);

            // Hover toggles global light theme explicitly on desktop
            deckCards.forEach(card => {
                card.addEventListener('mouseenter', () => document.body.classList.add('dark-theme'));
                card.addEventListener('mouseleave', () => document.body.classList.remove('dark-theme'));
            });
        }
    }
}

// 6. CINEMATIC SCROLL ANIMATIONS (GSAP)
const cinematicElements = gsap.utils.toArray('.cinematic-element');
cinematicElements.forEach(el => {
    gsap.fromTo(el,
        { y: 80, opacity: 0, scale: 0.95, rotationX: 5, transformPerspective: 1000 },
        {
            y: 0, opacity: 1, scale: 1, rotationX: 0,
            duration: 1.2, ease: "expo.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%", // trigger when 85% in view
                toggleActions: "play none none reverse"
            }
        }
    );
});

// 6. HERO PARALLAX FLOATING ELEMENTS
const floatingEls = gsap.utils.toArray('.floating-el');
floatingEls.forEach(el => {
    const speed = el.dataset.speed || 0.05;
    gsap.to(el, {
        y: () => -1000 * speed,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1
        }
    });
});


// 7. SKEUOMORPHIC 3D TILT EFFECT
const tiltCars = document.querySelectorAll('[data-tilt]');
tiltCars.forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Limit rotation for tactile feel
        const maxRot = 8;
        const rotX = -(y / rect.height) * maxRot;
        const rotY = (x / rect.width) * maxRot;

        gsap.to(card, {
            rotationX: rotX, rotationY: rotY,
            transformPerspective: 1000,
            ease: "power2.out", duration: 0.5
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotationX: 0, rotationY: 0,
            ease: "elastic.out(1, 0.5)", duration: 1.2
        });
    });
});

// 8. PROCESS BAR ANIMATION
const processSection = document.getElementById('process');
if (processSection) {
    const processFill = document.getElementById('process-fill');
    const steps = document.querySelectorAll('.process-step');
    const totalSteps = steps.length;

    ScrollTrigger.create({
        trigger: '#process',
        start: 'top 60%',
        end: 'bottom 40%',
        scrub: true,
        onUpdate: (self) => {
            const progress = self.progress;

            // For mobile, progress fills vertically. For Desktop horizontally.
            // If width < 768px, we manipulate height instead of width
            if (window.innerWidth <= 768) {
                processFill.style.height = `${progress * 100}%`;
                processFill.style.width = '100%';
            } else {
                processFill.style.width = `${progress * 100}%`;
                processFill.style.height = '100%';
            }

            const activeIndex = Math.floor(progress * (totalSteps - 1) + 0.05);

            steps.forEach((step, i) => {
                if (i <= activeIndex) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }
    });
}

// 9. STATS COUNTER ANIMATION
const statsSection = document.getElementById('stats');
if (statsSection) {
    const stats = document.querySelectorAll('.stat-number');
    const statBars = document.querySelectorAll('.stat-bar-fill');

    ScrollTrigger.create({
        trigger: '#stats',
        start: 'top 80%',
        once: true, // Only play once
        onEnter: () => {
            stats.forEach(stat => {
                const target = parseInt(stat.dataset.target);
                gsap.to(stat, {
                    innerHTML: target,
                    duration: 3,
                    ease: "power3.out",
                    snap: { innerHTML: 1 },
                    onUpdate: function () {
                        stat.innerHTML = Math.round(this.targets()[0].innerHTML) + (target > 50 ? '+' : '');
                    }
                });
            });
            statBars.forEach(bar => {
                bar.style.width = bar.dataset.width;
            });
        }
    });
}

// 10. FAQ ACCORDION LOGIC
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const answer = btn.nextElementSibling;
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        // Close all others
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            }
        });

        // Toggle current
        if (!isExpanded) {
            item.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
            // Calculate actual height needed
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            item.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
            answer.style.maxHeight = null;
        }

        // Refresh ScrollTrigger since heights changed
        setTimeout(() => ScrollTrigger.refresh(), 400);
    });
});

// 11. BUTTON TACTILE AUDIO / LOGIC (Optional polish)
const skeuBtns = document.querySelectorAll('.skeu-btn');
skeuBtns.forEach(btn => {
    btn.addEventListener('mousedown', () => {
        gsap.to(btn, { scale: 0.95, duration: 0.1 });
    });
    btn.addEventListener('mouseup', () => {
        gsap.to(btn, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
    });
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { scale: 1, duration: 0.4 });
    });
});

// 12. MACBOOK SHOWCASE LINEAR SPREAD
const showcaseContainer = document.querySelector('.macbook-showcase-container');
const macSlides = document.querySelectorAll('.macbook-slide');

if (showcaseContainer && macSlides.length === 3) {
    const isMobileShowcase = window.innerWidth <= 768;

    // Maintain CSS centering and explicitly set initial scale
    gsap.set(macSlides, { scale: 1, xPercent: -50, yPercent: -50, x: 0, y: 0 });

    let showcaseTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#showcase",
            start: "top top",
            end: "+=2000",
            scrub: 1,
            pin: true,
            anticipatePin: 1
        }
    });

    if (isMobileShowcase) {
        // Linear vertical spread on mobile
        showcaseTl.to(macSlides[2], { y: "40vh", scale: 0.85, duration: 1 }, 0)
            .to(macSlides[1], { y: 0, scale: 1, duration: 1 }, 0)
            .to(macSlides[0], { y: "-40vh", scale: 0.85, duration: 1 }, 0);
    } else {
        // Linear horizontal spread on desktop
        showcaseTl.to(macSlides[2], { x: "32vw", scale: 0.85, duration: 1 }, 0)
            .to(macSlides[1], { x: 0, scale: 1, duration: 1 }, 0)
            .to(macSlides[0], { x: "-32vw", scale: 0.85, duration: 1 }, 0);
    }

    // Add light theme hover trigger for desktop
    macSlides.forEach(slide => {
        slide.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) document.body.classList.add('dark-theme');
        });
        slide.addEventListener('mouseleave', () => document.body.classList.remove('dark-theme'));
    });
}
