// Custom Cursor Glow
const cursorGlow = document.querySelector('.cursor-glow');

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// Reveal Animations on Scroll
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    for (let i = 0; i < revealElements.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = revealElements[i].getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            revealElements[i].classList.add('active');
        }
    }
};

window.addEventListener('scroll', revealOnScroll);
// Initial check on load
window.addEventListener('load', revealOnScroll);

// Navbar scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(5, 7, 10, 0.9)';
        nav.style.padding = '1rem 10%';
    } else {
        nav.style.background = 'transparent';
        nav.style.padding = '1.5rem 10%';
    }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });
}

// Close mobile menu when link is clicked
const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
    });
});

// Initialize Lucide icons
if (window.lucide) {
    lucide.createIcons();
}
