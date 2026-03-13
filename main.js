// --- 1. SMOOTH SCROLLING WITH LENIS ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for cinematic feel
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Update ScrollTrigger on Lenis scroll
lenis.on('scroll', ScrollTrigger.update);

// Tell GSAP to use Lenis' requestAnimationFrame
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// --- 2. ADVANCED CANVAS FRAME SEQUENCE ---
const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");

const frameCount = 240;
const currentFrame = index => (
  `./frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const frames = { frame: 0 };

// Preload Images
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}
window.addEventListener('resize', resizeCanvas);

images[0].onload = resizeCanvas;

function render() {
    if(!images[frames.frame] || !images[frames.frame].complete) return;
    const img = images[frames.frame];
    
    // Cover logic
    const windowRatio = window.innerWidth / window.innerHeight;
    const imgRatio = img.width / img.height;
    
    let drawWidth, drawHeight, startX = 0, startY = 0;
    
    if (windowRatio > imgRatio) {
        drawWidth = window.innerWidth;
        drawHeight = drawWidth / imgRatio;
        startY = (window.innerHeight - drawHeight) / 2;
    } else {
        drawHeight = window.innerHeight;
        drawWidth = drawHeight * imgRatio;
        startX = (window.innerWidth - drawWidth) / 2;
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, startX, startY, drawWidth, drawHeight);
}

// GSAP sequence synced to Lenis/ScrollTrigger
gsap.to(frames, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: "#home", // Using top section
    start: "top top",
    end: () => "+=" + (window.innerHeight * 4), // Stretch animation over 4x viewport height
    scrub: 1, // Smooth scrubbing
    pin: true, // Pin the intro section slightly for drama
    pinSpacing: false,
  },
  onUpdate: render
});


// --- 3. VISION OS / LIQUID 3D HOVER INTERACTION ---

const hoverElements = document.querySelectorAll('[data-hover-liquid]');

hoverElements.forEach(el => {
    // 3D Tilt Effect
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -4; // Max rotation 4deg
        const rotateY = ((x - centerX) / centerX) * 4;
        
        // GSAP animate the tilt
        gsap.to(el, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1500,
            ease: "power2.out",
            duration: 0.5
        });

        // Add SVG Liquid Filter softly on move
        // Tweak turbulence dynamically if possible, or just toggle class
        // Here we just apply a CSS class that enables the SVG filter defined in HTML
        if (!el.classList.contains('apply-liquid')) {
            el.classList.add('apply-liquid');
            
            // Animate SVG baseFrequency to simulate water ripple
            const filter = document.querySelector('#liquid-filter feTurbulence');
            gsap.to(filter, {
                attr: { baseFrequency: "0.01" },
                duration: 1,
                yoyo: true,
                repeat: 1
            });
        }
    });

    el.addEventListener('mouseleave', () => {
        gsap.to(el, {
            rotationX: 0,
            rotationY: 0,
            ease: "elastic.out(1, 0.3)", // Bouncy return like Vision OS
            duration: 1.5
        });
        
        el.classList.remove('apply-liquid');
    });
});

// --- 4. CINEMATIC ENTRANCE ANIMATIONS ---

// Navbar shrink
const navbar = document.getElementById("navbar");
ScrollTrigger.create({
    start: "top -50",
    end: 99999,
    toggleClass: {className: "scale-[0.85]", targets: navbar}
});

ScrollTrigger.create({
    start: "top -50",
    end: 99999,
    toggleClass: {className: "bg-white/10", targets: navbar}
});

// Home Title Entrance
gsap.from(".hero-title", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out",
    delay: 0.2
});
gsap.from(".hero-text", {
    y: 50,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out",
    delay: 0.5,
    stagger: 0.2
});
gsap.from(".hero-btns", {
    y: 40,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out",
    delay: 0.8
});

// Scroll Reveal
const revealElements = document.querySelectorAll('.vision-card');
revealElements.forEach(card => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play reverse play reverse"
        },
        y: 100,
        opacity: 0.3,
        rotationX: -15, // Fold down
        transformPerspective: 1000,
        duration: 1.2,
        ease: "power3.out"
    });
});

// --- 5. INTERACTIVE LIQUID CURSOR ---
const cursor = document.getElementById('liquid-cursor');
const cursorBlob = cursor.querySelector('.cursor-blob');

// Hide default cursor on interactive areas
document.documentElement.style.cursor = 'none';

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Update mouse coordinates
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Show cursor on first move
    if (cursor.style.opacity === '0' || cursor.style.opacity === '') {
        cursor.style.opacity = '1';
    }
});

// Smooth follow logic using requestAnimationFrame
function loopCursor() {
    // Math.lerp for smooth trailing effect
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    // Center the cursor (offset by half of w-20 which is 40px)
    cursor.style.transform = `translate(${cursorX - 40}px, ${cursorY - 40}px)`;
    
    requestAnimationFrame(loopCursor);
}
requestAnimationFrame(loopCursor);

// Add hover states to interactable elements
const interactables = document.querySelectorAll('a, button, input, textarea, [data-hover-liquid]');

let waterFlowAni = null;

interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        // Expand the cursor like a magnifying water drop
        gsap.to(cursorBlob, {
            scale: 1, // Full 80x80px
            duration: 0.4,
            ease: "back.out(1.5)"
        });
        
        // Start fluid flowing animation by morphing border radius
        waterFlowAni = gsap.to(cursorBlob, {
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });

    el.addEventListener('mouseleave', () => {
        // Stop the fluid animation
        if (waterFlowAni) waterFlowAni.kill();
        
        // Shrink back to resting dot and round out
        gsap.to(cursorBlob, {
            scale: 0.2, // Back to small dot
            borderRadius: "50%",
            duration: 0.4,
            ease: "power2.out"
        });
    });
});

