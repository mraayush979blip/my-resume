const prefersReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = () => window.matchMedia && window.matchMedia('(pointer: fine)').matches;

// Custom Cursor Glow + Spotlight (rAF throttled)
const cursorGlow = document.querySelector('.cursor-glow');
const spotlight = document.getElementById('spotlight');
let pointerX = 0;
let pointerY = 0;
let pointerTicking = false;

document.addEventListener('mousemove', (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    if (pointerTicking) return;
    pointerTicking = true;
    requestAnimationFrame(() => {
        if (cursorGlow && hasFinePointer()) {
            cursorGlow.style.setProperty('--x', `${pointerX}px`);
            cursorGlow.style.setProperty('--y', `${pointerY}px`);
        }
        if (spotlight && !prefersReducedMotion() && hasFinePointer()) {
            spotlight.style.transform = `translate3d(${pointerX - window.innerWidth * 0.7}px, ${pointerY - window.innerHeight * 0.7}px, 0)`;
        }
        pointerTicking = false;
    });
}, { passive: true });

// Reveal Animations (IntersectionObserver to avoid scroll work)
const revealElements = document.querySelectorAll('.reveal');
const revealedOnce = new WeakSet();
const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('active');
        if (!revealedOnce.has(el) && !prefersReducedMotion()) {
            revealedOnce.add(el);
            const kids = Array.from(el.children || []);
            kids.slice(0, 10).forEach((kid, idx) => {
                kid.style.transitionDelay = `${idx * 70}ms`;
            });
        }
        obs.unobserve(el);
    });
}, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
revealElements.forEach(el => revealObserver.observe(el));

// Navbar scroll effect
const nav = document.querySelector('nav');
const updateNavbar = () => {
    if (!nav) return;
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(5, 7, 10, 0.9)';
        nav.style.padding = '1rem 10%';
    } else {
        nav.style.background = 'transparent';
        nav.style.padding = '1.5rem 10%';
    }
};

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
        if (mobileMenuBtn) {
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        }
    });
});

// Initialize Lucide icons
if (window.lucide) {
    lucide.createIcons();
}

// Active nav link on scroll (simple + lightweight)
const setActiveNavLink = () => {
    const sections = document.querySelectorAll('main section[id]');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !links.length) return;

    const scrollPos = window.scrollY + 120;
    let activeId = null;
    sections.forEach(sec => {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) activeId = sec.id;
    });

    links.forEach(a => {
        const href = a.getAttribute('href') || '';
        const isActive = activeId && href === `#${activeId}`;
        a.classList.toggle('is-active', Boolean(isActive));
    });
};
window.addEventListener('load', setActiveNavLink);

// Background parallax (subtle)
const updateParallax = () => {
    if (prefersReducedMotion()) return;
    const shift = Math.max(-40, Math.min(40, window.scrollY * 0.03));
    document.documentElement.style.setProperty('--bg-shift', `${shift}px`);
};
window.addEventListener('load', updateParallax);

// Single rAF scroll pipeline
let scrollTicking = false;
const runScrollPipeline = () => {
    updateNavbar();
    setActiveNavLink();
    updateParallax();
    scrollTicking = false;
};
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(runScrollPipeline);
}, { passive: true });

// Magnetic hover (buttons/chips)
const magneticEls = () => Array.from(document.querySelectorAll('.btn, .chip, .icon-btn, .resume-btn'));
const enableMagnetic = () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    magneticEls().forEach(el => {
        el.classList.add('magnetic');
        let rect = null;
        const strength = 0.18;

        const onEnter = () => { rect = el.getBoundingClientRect(); };
        const onMove = (e) => {
            if (!rect) rect = el.getBoundingClientRect();
            const mx = e.clientX - (rect.left + rect.width / 2);
            const my = e.clientY - (rect.top + rect.height / 2);
            el.style.transform = `translate3d(${mx * strength}px, ${my * strength}px, 0)`;
        };
        const onLeave = () => {
            rect = null;
            el.style.transform = '';
        };

        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mousemove', onMove, { passive: true });
        el.addEventListener('mouseleave', onLeave);
    });
};
window.addEventListener('load', enableMagnetic);

// 3D tilt cards (projects + skill cards) + shine
const tiltCards = () => Array.from(document.querySelectorAll('.project-card, .skill-category'));
const enableTilt = () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    tiltCards().forEach(card => {
        if (card.querySelector('.tilt-shine') == null) {
            const shine = document.createElement('div');
            shine.className = 'tilt-shine';
            card.appendChild(shine);
        }
        let rect = null;
        const max = 10;
        const shine = card.querySelector('.tilt-shine');

        const onEnter = () => { rect = card.getBoundingClientRect(); };
        const onMove = (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rx = (py - 0.5) * -max;
            const ry = (px - 0.5) * max;
            card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
            if (shine) {
                shine.style.setProperty('--mx', `${px * 100}%`);
                shine.style.setProperty('--my', `${py * 100}%`);
            }
        };
        const onLeave = () => {
            rect = null;
            card.style.transform = '';
        };

        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mousemove', onMove, { passive: true });
        card.addEventListener('mouseleave', onLeave);
    });
};
window.addEventListener('load', enableTilt);

// Hero typing + glitch micro-burst (first load)
const runHeroFx = () => {
    if (prefersReducedMotion()) return;
    const subtitle = document.getElementById('hero-subtitle');
    const title = document.getElementById('hero-title');
    if (title) {
        title.setAttribute('data-text', title.textContent.trim());
        title.classList.add('glitch');
        setTimeout(() => title.classList.remove('glitch'), 650);
    }
    if (!subtitle) return;
    const full = subtitle.getAttribute('data-typing') || subtitle.textContent || '';
    subtitle.textContent = '';
    let i = 0;
    const tick = () => {
        i += 1;
        subtitle.textContent = full.slice(0, i);
        if (i < full.length) requestAnimationFrame(tick);
    };
    // start after reveal begins
    setTimeout(() => requestAnimationFrame(tick), 350);
};
window.addEventListener('load', runHeroFx);

// Latest GitHub projects (public API, no key)
const GITHUB_USERNAME = 'mraayush979blip';
const githubGrid = document.getElementById('github-projects-grid');
const githubStatus = document.getElementById('github-projects-status');
const projectSearch = document.getElementById('project-search');

const formatCompactDate = (iso) => {
    try {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' }).format(new Date(iso));
    } catch {
        return '';
    }
};

const safeText = (value) => (typeof value === 'string' ? value : '');

const renderGithubSkeleton = (count = 4) => {
    if (!githubGrid) return;
    githubGrid.innerHTML = Array.from({ length: count }).map(() => `
        <div class="project-card reveal active skeleton" aria-hidden="true">
            <div class="project-info">
                <h3 style="opacity:0">Loading</h3>
                <p style="opacity:0">Loading</p>
                <p style="opacity:0">Loading</p>
            </div>
        </div>
    `).join('');
};

const renderGithubRepos = (repos) => {
    if (!githubGrid) return;
    githubGrid.innerHTML = repos.map(repo => {
        const name = safeText(repo.name);
        const desc = safeText(repo.description) || 'No description yet.';
        const url = safeText(repo.html_url);
        const homepage = safeText(repo.homepage);
        const lang = safeText(repo.language);
        const stars = Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0;
        const updated = safeText(repo.updated_at);
        const updatedLabel = updated ? formatCompactDate(updated) : '';

        const metaBits = [
            lang ? `<span><i data-lucide="code"></i>${lang}</span>` : '',
            `<span><i data-lucide="star"></i>${stars}</span>`,
            updatedLabel ? `<span><i data-lucide="clock"></i>${updatedLabel}</span>` : ''
        ].filter(Boolean).join('');

        const actions = [
            url ? `<a href="${url}" target="_blank" rel="noreferrer" class="btn secondary" style="padding: 8px 15px; font-size: 0.9em; text-decoration: none;">Code</a>` : '',
            homepage ? `<a href="${homepage}" target="_blank" rel="noreferrer" class="btn primary" style="padding: 8px 15px; font-size: 0.9em; text-decoration: none;">Live</a>` : ''
        ].filter(Boolean).join('');

        return `
            <div class="project-card reveal active">
                <div class="project-info">
                    <h3>${name}</h3>
                    <p>${desc}</p>
                    <div class="project-meta">${metaBits}</div>
                    <div class="project-actions">${actions}</div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
};

const loadGithubRepos = async () => {
    if (!githubGrid) return;
    if (githubStatus) githubStatus.textContent = '';
    renderGithubSkeleton(4);

    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=8&sort=updated`, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!res.ok) throw new Error(`GitHub API error (${res.status})`);

        const data = await res.json();
        const repos = Array.isArray(data) ? data : [];
        const filtered = repos
            .filter(r => r && !r.fork)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 6);

        if (!filtered.length) {
            githubGrid.innerHTML = '';
            if (githubStatus) githubStatus.textContent = 'No public repositories found to display.';
            return;
        }

        renderGithubRepos(filtered);
        if (githubStatus) githubStatus.textContent = `Showing ${filtered.length} recently updated repositories.`;
    } catch (err) {
        githubGrid.innerHTML = '';
        if (githubStatus) githubStatus.textContent = 'Could not load GitHub projects right now. Please try again later.';
    }
};

window.addEventListener('load', loadGithubRepos);

// Featured projects filter + search
const featuredCards = () => Array.from(document.querySelectorAll('#projects .projects-grid > .project-card'));
const normalize = (s) => (s || '').toString().trim().toLowerCase();

const applyProjectFilters = () => {
    const cards = featuredCards();
    if (!cards.length) return;

    const activeChip = document.querySelector('.chip-row .chip.is-active');
    const filter = activeChip ? activeChip.dataset.filter : 'all';
    const q = normalize(projectSearch ? projectSearch.value : '');

    let visible = 0;
    cards.forEach(card => {
        const tags = normalize(card.getAttribute('data-tags'));
        const text = normalize(card.innerText);
        const matchTag = filter === 'all' ? true : tags.includes(filter);
        const matchQuery = !q ? true : text.includes(q);
        const show = matchTag && matchQuery;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
    });

    const status = document.getElementById('github-projects-status');
    if (status && (filter !== 'all' || q)) {
        status.textContent = `Filtered featured projects: showing ${visible}.`;
    }
};

document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('.chip-row .chip') : null;
    if (!btn) return;
    document.querySelectorAll('.chip-row .chip').forEach(c => {
        c.classList.toggle('is-active', c === btn);
        c.setAttribute('aria-selected', c === btn ? 'true' : 'false');
    });
    applyProjectFilters();
});

if (projectSearch) {
    projectSearch.addEventListener('input', applyProjectFilters, { passive: true });
    window.addEventListener('load', applyProjectFilters);
}

// Case study modal (accessible dialog)
const caseModal = document.getElementById('case-modal');
const caseModalContent = document.getElementById('case-modal-content');
let lastFocusEl = null;

const CASE_STUDIES = {
    'LevelOne DSA': {
        problem: 'Students needed a single, structured place to learn DSA with practice + progress tracking.',
        approach: ['Designed a clear course structure with curated lectures + problems.', 'Used Supabase for auth/data and fast iteration.', 'Optimized UX for daily practice (quick resume + progress).'],
        results: ['Used by 100+ students.', 'Faster onboarding with structured curriculum.'],
        tech: ['Next.js', 'Tailwind', 'Supabase']
    },
    'Acropolis Attendance Management System': {
        problem: 'Manual attendance marking caused errors and slow reporting.',
        approach: ['Built role-based access for faculty/admin.', 'Added real-time attendance workflow with audit-friendly data.', 'Automated reporting to reduce admin overhead.'],
        results: ['Approved and live for 3rd Year IT department.', 'Reduced administrative errors.'],
        tech: ['React', 'Node.js', 'Firebase']
    },
    'LevelOne WebDev': {
        problem: 'Learners needed project-based modules aligned with industry-ready standards.',
        approach: ['Created interactive modules and project roadmaps.', 'Kept content editable and scalable.', 'Focused on outcomes and practical builds.'],
        results: ['Integrated into LevelOne suite for placement roadmap.'],
        tech: ['Next.js', 'Markdown', 'Framer Motion']
    },
    'GapShap AI': {
        problem: 'Showcase low-latency AI chat with persona-based experiences.',
        approach: ['Built chat UI and persona prompts.', 'Integrated LLM provider for fast responses.', 'Used Supabase to support real-time app structure.'],
        results: ['Demonstrates modern AI integration with real-time architecture.'],
        tech: ['React', 'Groq Cloud', 'Supabase']
    },
    'Shree Shyam Kunj Living Hub': {
        problem: 'Real estate brand needed a premium lead-gen portal with strong visuals.',
        approach: ['Designed listing UX with amenities/floor plans focus.', 'Optimized for conversions with clear CTAs.', 'Used Cloudinary-style asset delivery patterns.'],
        results: ['Improved digital presence and customer engagement.'],
        tech: ['Next.js', 'Tailwind', 'Cloudinary']
    }
};

const openCaseModal = (title) => {
    if (!caseModal || !caseModalContent) return;
    const data = CASE_STUDIES[title];
    if (!data) return;

    lastFocusEl = document.activeElement;
    caseModalContent.innerHTML = `
        <h3 class="case-title">${title}</h3>
        <div class="case-grid">
            <div>
                <h4>Problem</h4>
                <p>${data.problem}</p>
            </div>
            <div>
                <h4>Approach</h4>
                <ul>${data.approach.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div>
                <h4>Results</h4>
                <ul>${data.results.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div>
                <h4>Tech</h4>
                <div class="skill-tags">${data.tech.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
        </div>
    `;

    if (typeof caseModal.showModal === 'function') {
        caseModal.showModal();
    } else {
        caseModal.setAttribute('open', '');
    }

    const closeBtn = caseModal.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.focus();
    if (window.lucide) lucide.createIcons();
};

const closeCaseModal = () => {
    if (!caseModal) return;
    if (typeof caseModal.close === 'function') caseModal.close();
    else caseModal.removeAttribute('open');
    if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus();
};

document.addEventListener('click', (e) => {
    const openBtn = e.target && e.target.closest ? e.target.closest('.js-open-case') : null;
    if (openBtn) {
        const card = openBtn.closest('.project-card');
        const titleEl = card ? card.querySelector('h3') : null;
        const title = titleEl ? titleEl.textContent.trim() : '';
        openCaseModal(title);
        return;
    }

    const closeBtn = e.target && e.target.closest ? e.target.closest('[data-close-modal]') : null;
    if (closeBtn) closeCaseModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseModal && caseModal.open) closeCaseModal();
});

if (caseModal) {
    caseModal.addEventListener('click', (e) => {
        const inner = caseModal.querySelector('.case-modal__inner');
        if (inner && !inner.contains(e.target)) closeCaseModal();
    });
}

// Contact form submit (configurable endpoint; fallback to mailto)
const CONTACT_ENDPOINT = ''; // e.g. "https://formspree.io/f/xxxxxx" or your own API URL
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

const setContactStatus = (msg) => {
    if (contactStatus) contactStatus.textContent = msg;
};

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(contactForm);
        const payload = {
            name: safeText(fd.get('name')),
            email: safeText(fd.get('email')),
            message: safeText(fd.get('message'))
        };

        if (!payload.name || !payload.email || !payload.message) {
            setContactStatus('Please fill in all fields.');
            return;
        }

        // If no endpoint configured, fallback to email client.
        if (!CONTACT_ENDPOINT) {
            const subject = encodeURIComponent(`Portfolio message from ${payload.name}`);
            const body = encodeURIComponent(`${payload.message}\n\nFrom: ${payload.name}\nEmail:             revealedOnce.add(el);
            const kids = Array.from(el.children || []);
            kids.slice(0, 10).forEach((kid, idx) => {
                kid.style.transitionDelay = `${idx * 70}ms`;
            });
        }
        obs.unobserve(el);
    });
}, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
revealElements.forEach(el => revealObserver.observe(el));

// Navbar scroll effect
const nav = document.querySelector('nav');
const updateNavbar = () => {
    if (!nav) return;
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(5, 7, 10, 0.9)';
        nav.style.padding = '1rem 10%';
    } else {
        nav.style.background = 'transparent';
        nav.style.padding = '1.5rem 10%';
    }
};

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

// Active nav link on scroll (simple + lightweight)
const setActiveNavLink = () => {
    const sections = document.querySelectorAll('main section[id]');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !links.length) return;

    const scrollPos = window.scrollY + 120;
    let activeId = null;
    sections.forEach(sec => {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) activeId = sec.id;
    });

    links.forEach(a => {
        const href = a.getAttribute('href') || '';
        const isActive = activeId && href === `#${activeId}`;
        a.classList.toggle('is-active', Boolean(isActive));
    });
};
window.addEventListener('load', setActiveNavLink);

// Background parallax (subtle)
const updateParallax = () => {
    if (prefersReducedMotion()) return;
    const shift = Math.max(-40, Math.min(40, window.scrollY * 0.03));
    document.documentElement.style.setProperty('--bg-shift', `${shift}px`);
};
window.addEventListener('load', updateParallax);

// Single rAF scroll pipeline
let scrollTicking = false;
const runScrollPipeline = () => {
    updateNavbar();
    setActiveNavLink();
    updateParallax();
    scrollTicking = false;
};
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(runScrollPipeline);
}, { passive: true });

// Magnetic hover (buttons/chips)
const magneticEls = () => Array.from(document.querySelectorAll('.btn, .chip, .icon-btn, .resume-btn'));
const enableMagnetic = () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    magneticEls().forEach(el => {
        el.classList.add('magnetic');
        let rect = null;
        const strength = 0.18;

        const onEnter = () => { rect = el.getBoundingClientRect(); };
        const onMove = (e) => {
            if (!rect) rect = el.getBoundingClientRect();
            const mx = e.clientX - (rect.left + rect.width / 2);
            const my = e.clientY - (rect.top + rect.height / 2);
            el.style.transform = `translate3d(${mx * strength}px, ${my * strength}px, 0)`;
        };
        const onLeave = () => {
            rect = null;
            el.style.transform = '';
        };

        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mousemove', onMove, { passive: true });
        el.addEventListener('mouseleave', onLeave);
    });
};
window.addEventListener('load', enableMagnetic);

// 3D tilt cards (projects + skill cards) + shine
const tiltCards = () => Array.from(document.querySelectorAll('.project-card, .skill-category'));
const enableTilt = () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    tiltCards().forEach(card => {
        if (card.querySelector('.tilt-shine') == null) {
            const shine = document.createElement('div');
            shine.className = 'tilt-shine';
            card.appendChild(shine);
        }
        let rect = null;
        const max = 10;
        const shine = card.querySelector('.tilt-shine');

        const onEnter = () => { rect = card.getBoundingClientRect(); };
        const onMove = (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rx = (py - 0.5) * -max;
            const ry = (px - 0.5) * max;
            card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
            if (shine) {
                shine.style.setProperty('--mx', `${px * 100}%`);
                shine.style.setProperty('--my', `${py * 100}%`);
            }
        };
        const onLeave = () => {
            rect = null;
            card.style.transform = '';
        };

        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mousemove', onMove, { passive: true });
        card.addEventListener('mouseleave', onLeave);
    });
};
window.addEventListener('load', enableTilt);

// Hero typing + glitch micro-burst (first load)
const runHeroFx = () => {
    if (prefersReducedMotion()) return;
    const subtitle = document.getElementById('hero-subtitle');
    const title = document.getElementById('hero-title');
    if (title) {
        title.setAttribute('data-text', title.textContent.trim());
        title.classList.add('glitch');
        setTimeout(() => title.classList.remove('glitch'), 650);
    }
    if (!subtitle) return;
    const full = subtitle.getAttribute('data-typing') || subtitle.textContent || '';
    subtitle.textContent = '';
    let i = 0;
    const tick = () => {
        i += 1;
        subtitle.textContent = full.slice(0, i);
        if (i < full.length) requestAnimationFrame(tick);
    };
    // start after reveal begins
    setTimeout(() => requestAnimationFrame(tick), 350);
};
window.addEventListener('load', runHeroFx);

// Latest GitHub projects (public API, no key)
const GITHUB_USERNAME = 'mraayush979blip';
const githubGrid = document.getElementById('github-projects-grid');
const githubStatus = document.getElementById('github-projects-status');
const projectSearch = document.getElementById('project-search');

const formatCompactDate = (iso) => {
    try {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' }).format(new Date(iso));
    } catch {
        return '';
    }
};

const safeText = (value) => (typeof value === 'string' ? value : '');

const renderGithubSkeleton = (count = 4) => {
    if (!githubGrid) return;
    githubGrid.innerHTML = Array.from({ length: count }).map(() => `
        <div class="project-card reveal active skeleton" aria-hidden="true">
            <div class="project-info">
                <h3 style="opacity:0">Loading</h3>
                <p style="opacity:0">Loading</p>
                <p style="opacity:0">Loading</p>
            </div>
        </div>
    `).join('');
};

const renderGithubRepos = (repos) => {
    if (!githubGrid) return;
    githubGrid.innerHTML = repos.map(repo => {
        const name = safeText(repo.name);
        const desc = safeText(repo.description) || 'No description yet.';
        const url = safeText(repo.html_url);
        const homepage = safeText(repo.homepage);
        const lang = safeText(repo.language);
        const stars = Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0;
        const updated = safeText(repo.updated_at);
        const updatedLabel = updated ? formatCompactDate(updated) : '';

        const metaBits = [
            lang ? `<span><i data-lucide="code"></i>${lang}</span>` : '',
            `<span><i data-lucide="star"></i>${stars}</span>`,
            updatedLabel ? `<span><i data-lucide="clock"></i>${updatedLabel}</span>` : ''
        ].filter(Boolean).join('');

        const actions = [
            url ? `<a href="${url}" target="_blank" rel="noreferrer" class="btn secondary" style="padding: 8px 15px; font-size: 0.9em; text-decoration: none;">Code</a>` : '',
            homepage ? `<a href="${homepage}" target="_blank" rel="noreferrer" class="btn primary" style="padding: 8px 15px; font-size: 0.9em; text-decoration: none;">Live</a>` : ''
        ].filter(Boolean).join('');

        return `
            <div class="project-card reveal active">
                <div class="project-info">
                    <h3>${name}</h3>
                    <p>${desc}</p>
                    <div class="project-meta">${metaBits}</div>
                    <div class="project-actions">${actions}</div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
};

const loadGithubRepos = async () => {
    if (!githubGrid) return;
    if (githubStatus) githubStatus.textContent = '';
    renderGithubSkeleton(4);

    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=8&sort=updated`, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!res.ok) throw new Error(`GitHub API error (${res.status})`);

        const data = await res.json();
        const repos = Array.isArray(data) ? data : [];
        const filtered = repos
            .filter(r => r && !r.fork)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 6);

        if (!filtered.length) {
            githubGrid.innerHTML = '';
            if (githubStatus) githubStatus.textContent = 'No public repositories found to display.';
            return;
        }

        renderGithubRepos(filtered);
        if (githubStatus) githubStatus.textContent = `Showing ${filtered.length} recently updated repositories.`;
    } catch (err) {
        githubGrid.innerHTML = '';
        if (githubStatus) githubStatus.textContent = 'Could not load GitHub projects right now. Please try again later.';
    }
};

window.addEventListener('load', loadGithubRepos);

// Featured projects filter + search
const featuredCards = () => Array.from(document.querySelectorAll('#projects .projects-grid > .project-card'));
const normalize = (s) => (s || '').toString().trim().toLowerCase();

const applyProjectFilters = () => {
    const cards = featuredCards();
    if (!cards.length) return;

    const activeChip = document.querySelector('.chip-row .chip.is-active');
    const filter = activeChip ? activeChip.dataset.filter : 'all';
    const q = normalize(projectSearch ? projectSearch.value : '');

    let visible = 0;
    cards.forEach(card => {
        const tags = normalize(card.getAttribute('data-tags'));
        const text = normalize(card.innerText);
        const matchTag = filter === 'all' ? true : tags.includes(filter);
        const matchQuery = !q ? true : text.includes(q);
        const show = matchTag && matchQuery;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
    });

    const status = document.getElementById('github-projects-status');
    if (status && (filter !== 'all' || q)) {
        status.textContent = `Filtered featured projects: showing ${visible}.`;
    }
};

document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('.chip-row .chip') : null;
    if (!btn) return;
    document.querySelectorAll('.chip-row .chip').forEach(c => {
        c.classList.toggle('is-active', c === btn);
        c.setAttribute('aria-selected', c === btn ? 'true' : 'false');
    });
    applyProjectFilters();
});

if (projectSearch) {
    projectSearch.addEventListener('input', applyProjectFilters, { passive: true });
    window.addEventListener('load', applyProjectFilters);
}

// Case study modal (accessible dialog)
const caseModal = document.getElementById('case-modal');
const caseModalContent = document.getElementById('case-modal-content');
let lastFocusEl = null;

const CASE_STUDIES = {
    'LevelOne DSA': {
        problem: 'Students needed a single, structured place to learn DSA with practice + progress tracking.',
        approach: ['Designed a clear course structure with curated lectures + problems.', 'Used Supabase for auth/data and fast iteration.', 'Optimized UX for daily practice (quick resume + progress).'],
        results: ['Used by 100+ students.', 'Faster onboarding with structured curriculum.'],
        tech: ['Next.js', 'Tailwind', 'Supabase']
    },
    'Acropolis Attendance Management System': {
        problem: 'Manual attendance marking caused errors and slow reporting.',
        approach: ['Built role-based access for faculty/admin.', 'Added real-time attendance workflow with audit-friendly data.', 'Automated reporting to reduce admin overhead.'],
        results: ['Approved and live for 3rd Year IT department.', 'Reduced administrative errors.'],
        tech: ['React', 'Node.js', 'Firebase']
    },
    'LevelOne WebDev': {
        problem: 'Learners needed project-based modules aligned with industry-ready standards.',
        approach: ['Created interactive modules and project roadmaps.', 'Kept content editable and scalable.', 'Focused on outcomes and practical builds.'],
        results: ['Integrated into LevelOne suite for placement roadmap.'],
        tech: ['Next.js', 'Markdown', 'Framer Motion']
    },
    'GapShap AI': {
        problem: 'Showcase low-latency AI chat with persona-based experiences.',
        approach: ['Built chat UI and persona prompts.', 'Integrated LLM provider for fast responses.', 'Used Supabase to support real-time app structure.'],
        results: ['Demonstrates modern AI integration with real-time architecture.'],
        tech: ['React', 'Groq Cloud', 'Supabase']
    },
    'Shree Shyam Kunj Living Hub': {
        problem: 'Real estate brand needed a premium lead-gen portal with strong visuals.',
        approach: ['Designed listing UX with amenities/floor plans focus.', 'Optimized for conversions with clear CTAs.', 'Used Cloudinary-style asset delivery patterns.'],
        results: ['Improved digital presence and customer engagement.'],
        tech: ['Next.js', 'Tailwind', 'Cloudinary']
    }
};

const openCaseModal = (title) => {
    if (!caseModal || !caseModalContent) return;
    const data = CASE_STUDIES[title];
    if (!data) return;

    lastFocusEl = document.activeElement;
    caseModalContent.innerHTML = `
        <h3 class="case-title">${title}</h3>
        <div class="case-grid">
            <div>
                <h4>Problem</h4>
                <p>${data.problem}</p>
            </div>
            <div>
                <h4>Approach</h4>
                <ul>${data.approach.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div>
                <h4>Results</h4>
                <ul>${data.results.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div>
                <h4>Tech</h4>
                <div class="skill-tags">${data.tech.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
        </div>
    `;

    if (typeof caseModal.showModal === 'function') {
        caseModal.showModal();
    } else {
        caseModal.setAttribute('open', '');
    }

    const closeBtn = caseModal.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.focus();
    if (window.lucide) lucide.createIcons();
};

const closeCaseModal = () => {
    if (!caseModal) return;
    if (typeof caseModal.close === 'function') caseModal.close();
    else caseModal.removeAttribute('open');
    if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus();
};

document.addEventListener('click', (e) => {
    const openBtn = e.target && e.target.closest ? e.target.closest('.js-open-case') : null;
    if (openBtn) {
        const card = openBtn.closest('.project-card');
        const titleEl = card ? card.querySelector('h3') : null;
        const title = titleEl ? titleEl.textContent.trim() : '';
        openCaseModal(title);
        return;
    }

    const closeBtn = e.target && e.target.closest ? e.target.closest('[data-close-modal]') : null;
    if (closeBtn) closeCaseModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseModal && caseModal.open) closeCaseModal();
});

if (caseModal) {
    caseModal.addEventListener('click', (e) => {
        const inner = caseModal.querySelector('.case-modal__inner');
        if (inner && !inner.contains(e.target)) closeCaseModal();
    });
}

// Contact form submit (configurable endpoint; fallback to mailto)
const CONTACT_ENDPOINT = ''; // e.g. "https://formspree.io/f/xxxxxx" or your own API URL
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

const setContactStatus = (msg) => {
    if (contactStatus) contactStatus.textContent = msg;
};

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(contactForm);
        const payload = {
            name: safeText(fd.get('name')),
            email: safeText(fd.get('email')),
            message: safeText(fd.get('message'))
        };

        if (!payload.name || !payload.email || !payload.message) {
            setContactStatus('Please fill in all fields.');
            return;
        }

        // If no endpoint configured, fallback to email client.
        if (!CONTACT_ENDPOINT) {
            const subject = encodeURIComponent(`Portfolio message from ${payload.name}`);
            const body = encodeURIComponent(`${payload.message}\n\nFrom: ${payload.name}\nEmail: ${payload.email}`);
            window.location.href = `mailt            revealedOnce.add(el);
            const kids = Array.from(el.children || []);
            kids.slice(0, 10).forEach((kid, idx) => {
                kid.style.transitionDelay = `${idx * 70}ms`;
            });
        }
        obs.unobserve(el);
    });
}, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
revealElements.forEach(el => revealObserver.observe(el));

// Navbar scroll effect
const nav = document.querySelector('nav');
const updateNavbar = () => {
    if (!nav) return;
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(5, 7, 10, 0.9)';
        nav.style.padding = '1rem 10%';
    } else {
        nav.style.background = 'transparent';
        nav.style.padding = '1.5rem 10%';
    }
};

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

// Active nav link on scroll (simple + lightweight)
const setActiveNavLink = () => {
    const sections = document.querySelectorAll('main section[id]');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !links.length) return;

    const scrollPos = window.scrollY + 120;
    let activeId = null;
    sections.forEach(sec => {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) activeId = sec.id;
    });

    links.forEach(a => {
        const href = a.getAttribute('href') || '';
        const isActive = activeId && href === `#${activeId}`;
        a.classList.toggle('is-active', Boolean(isActive));
    });
};
window.addEventListener('load', setActiveNavLink);

// Background parallax (subtle)
const updateParallax = () => {
    if (prefersReducedMotion()) return;
    const shift = Math.max(-40, Math.min(40, window.scrollY * 0.03));
    document.documentElement.style.setProperty('--bg-shift', `${shift}px`);
};
window.addEventListener('load', updateParallax);

// Single rAF scroll pipeline
let scrollTicking = false;
const runScrollPipeline = () => {
    updateNavbar();
    setActiveNavLink();
    updateParallax();
    scrollTicking = false;
};
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(runScrollPipeline);
}, { passive: true });

// Magnetic hover (buttons/chips)
const magneticEls = () => Array.from(document.querySelectorAll('.btn, .chip, .icon-btn, .resume-btn'));
const enableMagnetic = () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    magneticEls().forEach(el => {
        el.classList.add('magnetic');
        let rect = null;
        const strength = 0.18;

        const onEnter = () => { rect = el.getBoundingClientRect(); };
        const onMove = (e) => {
            if (!rect) rect = el.getBoundingClientRect();
            const mx = e.clientX - (rect.left + rect.width / 2);
            const my = e.clientY - (rect.top + rect.height / 2);
            el.style.transform = `translate3d(${mx * strength}px, ${my * strength}px, 0)`;
        };
        const onLeave = () => {
            rect = null;
            el.style.transform = '';
        };

        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mousemove', onMove, { passive: true });
        el.addEventListener('mouseleave', onLeave);
    });
};
window.addEventListener('load', enableMagnetic);

// 3D tilt cards (projects + skill cards) + shine
const tiltCards = () => Array.from(document.querySelectorAll('.project-card, .skill-category'));
const enableTilt = () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    tiltCards().forEach(card => {
        if (card.querySelector('.tilt-shine') == null) {
            const shine = document.createElement('div');
            shine.className = 'tilt-shine';
            card.appendChild(shine);
        }
        let rect = null;
        const max = 10;
        const shine = card.querySelector('.tilt-shine');

        const onEnter = () => { rect = card.getBoundingClientRect(); };
        const onMove = (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rx = (py - 0.5) * -max;
            const ry = (px - 0.5) * max;
            card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
            if (shine) {
                shine.style.setProperty('--mx', `${px * 100}%`);
                shine.style.setProperty('--my', `${py * 100}%`);
            }
        };
        const onLeave = () => {
            rect = null;
            card.style.transform = '';
        };

        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mousemove', onMove, { passive: true });
        card.addEventListener('mouseleave', onLeave);
    });
};
window.addEventListener('load', enableTilt);

// Hero typing + glitch micro-burst (first load)
const runHeroFx = () => {
    if (prefersReducedMotion()) return;
    const subtitle = document.getElementById('hero-subtitle');
    const title = document.getElementById('hero-title');
    if (title) {
        title.setAttribute('data-text', title.textContent.trim());
        title.classList.add('glitch');
        setTimeout(() => title.classList.remove('glitch'), 650);
    }
    if (!subtitle) return;
    const full = subtitle.getAttribute('data-typing') || subtitle.textContent || '';
    subtitle.textContent = '';
    let i = 0;
    const tick = () => {
        i += 1;
        subtitle.textContent = full.slice(0, i);
        if (i < full.length) requestAnimationFrame(tick);
    };
    // start after reveal begins
    setTimeout(() => requestAnimationFrame(tick), 350);
};
window.addEventListener('load', runHeroFx);

// Latest GitHub projects (public API, no key)
const GITHUB_USERNAME = 'mraayush979blip';
const githubGrid = document.getElementById('github-projects-grid');
const githubStatus = document.getElementById('github-projects-status');
const projectSearch = document.getElementById('project-search');

const formatCompactDate = (iso) => {
    try {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' }).format(new Date(iso));
    } catch {
        return '';
    }
};

const safeText = (value) => (typeof value === 'string' ? value : '');

const renderGithubSkeleton = (count = 4) => {
    if (!githubGrid) return;
    githubGrid.innerHTML = Array.from({ length: count }).map(() => `
        <div class="project-card reveal active skeleton" aria-hidden="true">
            <div class="project-info">
                <h3 style="opacity:0">Loading</h3>
                <p style="opacity:0">Loading</p>
                <p style="opacity:0">Loading</p>
            </div>
        </div>
    `).join('');
};

const renderGithubRepos = (repos) => {
    if (!githubGrid) return;
    githubGrid.innerHTML = repos.map(repo => {
        const name = safeText(repo.name);
        const desc = safeText(repo.description) || 'No description yet.';
        const url = safeText(repo.html_url);
        const homepage = safeText(repo.homepage);
        const lang = safeText(repo.language);
        const stars = Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0;
        const updated = safeText(repo.updated_at);
        const updatedLabel = updated ? formatCompactDate(updated) : '';

        const metaBits = [
            lang ? `<span><i data-lucide="code"></i>${lang}</span>` : '',
            `<span><i data-lucide="star"></i>${stars}</span>`,
            updatedLabel ? `<span><i data-lucide="clock"></i>${updatedLabel}</span>` : ''
        ].filter(Boolean).join('');

        const actions = [
            url ? `<a href="${url}" target="_blank" rel="noreferrer" class="btn secondary" style="padding: 8px 15px; font-size: 0.9em; text-decoration: none;">Code</a>` : '',
            homepage ? `<a href="${homepage}" target="_blank" rel="noreferrer" class="btn primary" style="padding: 8px 15px; font-size: 0.9em; text-decoration: none;">Live</a>` : ''
        ].filter(Boolean).join('');

        return `
            <div class="project-card reveal active">
                <div class="project-info">
                    <h3>${name}</h3>
                    <p>${desc}</p>
                    <div class="project-meta">${metaBits}</div>
                    <div class="project-actions">${actions}</div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
};

const loadGithubRepos = async () => {
    if (!githubGrid) return;
    if (githubStatus) githubStatus.textContent = '';
    renderGithubSkeleton(4);

    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=8&sort=updated`, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!res.ok) throw new Error(`GitHub API error (${res.status})`);

        const data = await res.json();
        const repos = Array.isArray(data) ? data : [];
        const filtered = repos
            .filter(r => r && !r.fork)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 6);

        if (!filtered.length) {
            githubGrid.innerHTML = '';
            if (githubStatus) githubStatus.textContent = 'No public repositories found to display.';
            return;
        }

        renderGithubRepos(filtered);
        if (githubStatus) githubStatus.textContent = `Showing ${filtered.length} recently updated repositories.`;
    } catch (err) {
        githubGrid.innerHTML = '';
        if (githubStatus) githubStatus.textContent = 'Could not load GitHub projects right now. Please try again later.';
    }
};

window.addEventListener('load', loadGithubRepos);

// Featured projects filter + search
const featuredCards = () => Array.from(document.querySelectorAll('#projects .projects-grid > .project-card'));
const normalize = (s) => (s || '').toString().trim().toLowerCase();

const applyProjectFilters = () => {
    const cards = featuredCards();
    if (!cards.length) return;

    const activeChip = document.querySelector('.chip-row .chip.is-active');
    const filter = activeChip ? activeChip.dataset.filter : 'all';
    const q = normalize(projectSearch ? projectSearch.value : '');

    let visible = 0;
    cards.forEach(card => {
        const tags = normalize(card.getAttribute('data-tags'));
        const text = normalize(card.innerText);
        const matchTag = filter === 'all' ? true : tags.includes(filter);
        const matchQuery = !q ? true : text.includes(q);
        const show = matchTag && matchQuery;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
    });

    const status = document.getElementById('github-projects-status');
    if (status && (filter !== 'all' || q)) {
        status.textContent = `Filtered featured projects: showing ${visible}.`;
    }
};

document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('.chip-row .chip') : null;
    if (!btn) return;
    document.querySelectorAll('.chip-row .chip').forEach(c => {
        c.classList.toggle('is-active', c === btn);
        c.setAttribute('aria-selected', c === btn ? 'true' : 'false');
    });
    applyProjectFilters();
});

if (projectSearch) {
    projectSearch.addEventListener('input', applyProjectFilters, { passive: true });
    window.addEventListener('load', applyProjectFilters);
}

// Case study modal (accessible dialog)
const caseModal = document.getElementById('case-modal');
const caseModalContent = document.getElementById('case-modal-content');
let lastFocusEl = null;

const CASE_STUDIES = {
    'LevelOne DSA': {
        problem: 'Students needed a single, structured place to learn DSA with practice + progress tracking.',
        approach: ['Designed a clear course structure with curated lectures + problems.', 'Used Supabase for auth/data and fast iteration.', 'Optimized UX for daily practice (quick resume + progress).'],
        results: ['Used by 100+ students.', 'Faster onboarding with structured curriculum.'],
        tech: ['Next.js', 'Tailwind', 'Supabase']
    },
    'Acropolis Attendance Management System': {
        problem: 'Manual attendance marking caused errors and slow reporting.',
        approach: ['Built role-based access for faculty/admin.', 'Added real-time attendance workflow with audit-friendly data.', 'Automated reporting to reduce admin overhead.'],
        results: ['Approved and live for 3rd Year IT department.', 'Reduced administrative errors.'],
        tech: ['React', 'Node.js', 'Firebase']
    },
    'LevelOne WebDev': {
        problem: 'Learners needed project-based modules aligned with industry-ready standards.',
        approach: ['Created interactive modules and project roadmaps.', 'Kept content editable and scalable.', 'Focused on outcomes and practical builds.'],
        results: ['Integrated into LevelOne suite for placement roadmap.'],
        tech: ['Next.js', 'Markdown', 'Framer Motion']
    },
    'GapShap AI': {
        problem: 'Showcase low-latency AI chat with persona-based experiences.',
        approach: ['Built chat UI and persona prompts.', 'Integrated LLM provider for fast responses.', 'Used Supabase to support real-time app structure.'],
        results: ['Demonstrates modern AI integration with real-time architecture.'],
        tech: ['React', 'Groq Cloud', 'Supabase']
    },
    'Shree Shyam Kunj Living Hub': {
        problem: 'Real estate brand needed a premium lead-gen portal with strong visuals.',
        approach: ['Designed listing UX with amenities/floor plans focus.', 'Optimized for conversions with clear CTAs.', 'Used Cloudinary-style asset delivery patterns.'],
        results: ['Improved digital presence and customer engagement.'],
        tech: ['Next.js', 'Tailwind', 'Cloudinary']
    }
};

const openCaseModal = (title) => {
    if (!caseModal || !caseModalContent) return;
    const data = CASE_STUDIES[title];
    if (!data) return;

    lastFocusEl = document.activeElement;
    caseModalContent.innerHTML = `
        <h3 class="case-title">${title}</h3>
        <div class="case-grid">
            <div>
                <h4>Problem</h4>
                <p>${data.problem}</p>
            </div>
            <div>
                <h4>Approach</h4>
                <ul>${data.approach.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div>
                <h4>Results</h4>
                <ul>${data.results.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div>
                <h4>Tech</h4>
                <div class="skill-tags">${data.tech.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
        </div>
    `;

    if (typeof caseModal.showModal === 'function') {
        caseModal.showModal();
    } else {
        caseModal.setAttribute('open', '');
    }

    const closeBtn = caseModal.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.focus();
    if (window.lucide) lucide.createIcons();
};

const closeCaseModal = () => {
    if (!caseModal) return;
    if (typeof caseModal.close === 'function') caseModal.close();
    else caseModal.removeAttribute('open');
    if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus();
};

document.addEventListener('click', (e) => {
    const openBtn = e.target && e.target.closest ? e.target.closest('.js-open-case') : null;
    if (openBtn) {
        const card = openBtn.closest('.project-card');
        const titleEl = card ? card.querySelector('h3') : null;
        const title = titleEl ? titleEl.textContent.trim() : '';
        openCaseModal(title);
        return;
    }

    const closeBtn = e.target && e.target.closest ? e.target.closest('[data-close-modal]') : null;
    if (closeBtn) closeCaseModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseModal && caseModal.open) closeCaseModal();
});

if (caseModal) {
    caseModal.addEventListener('click', (e) => {
        const inner = caseModal.querySelector('.case-modal__inner');
        if (inner && !inner.contains(e.target)) closeCaseModal();
    });
}

// Contact form submit (configurable endpoint; fallback to mailto)
const CONTACT_ENDPOINT = ''; // e.g. "https://formspree.io/f/xxxxxx" or your own API URL
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

const setContactStatus = (msg) => {
    if (contactStatus) contactStatus.textContent = msg;
};

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(contactForm);
        const payload = {
            name: safeText(fd.get('name')),
            email: safeText(fd.get('email')),
            message: safeText(fd.get('message'))
        };

        if (!payload.name || !payload.email || !payload.message) {
            setContactStatus('Please fill in all fields.');
            return;
        }

        // If no endpoint configured, fallback to email client.
        if (!CONTACT_ENDPOINT) {
            const subject = encodeURIComponent(`Portfolio message from ${payload.name}`);
            const body = encodeURIComponent(`${payload.message}\n\nFrom: ${payload.name}\nEmail: ${payload.email}`);
            window.location.href = `mailt modal = document.getElementById('case-modal');
    const content = document.getElementById('case-modal-content');
    const data = CASE_STUDIES[title];
    if (!modal || !data) return;

    content.innerHTML = `
        <h3>${title}</h3>
        <p><strong>Problem:</strong> ${data.problem}</p>
        <p><strong>Approach:</strong> ${data.approach.join(', ')}</p>
        <p><strong>Results:</strong> ${data.results.join(', ')}</p>
        <div class="skill-tags">${data.tech.map(t => `<span>${t}</span>`).join('')}</div>
    `;
    modal.showModal();
    lucide.createIcons();
};

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-open-case');
    if (btn) {
        const title = btn.closest('.project-card').querySelector('h3').textContent;
        openCaseModal(title);
    }
    if (e.target.closest('[data-close-modal]')) document.getElementById('case-modal').close();
});

// Contact Form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(contactForm);
        const name = fd.get('name');
        const message = fd.get('message');
        window.location.href = `mailto:mraayush979@gmail.com?subject=Contact from ${name}&body=${message}`;
    });
}

// Initializing all features on window load
window.addEventListener('load', () => {
    updateNavbar();
    setActiveNavLink();
    enableMagnetic();
    enableTilt();
    runHeroFx();
    loadGithubRepos();
});
            revealedOnce.add(el);
            const kids = Array.from(el.children || []);
            kids.slice(0, 10).forEach((kid, idx) => {
                kid.style.transitionDelay = `${idx * 70}ms`;
            });
        }
        obs.unobserve(el);
    });
}, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
revealElements.forEach(el => revealObserver.observe(el));

// Navbar scroll effect
const nav = document.querySelector('nav');
const updateNavbar = () => {
    if (!nav) return;
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(5, 7, 10, 0.9)';
        nav.style.padding = '1rem 10%';
    } else {
        nav.style.background = 'transparent';
        nav.style.padding = '1.5rem 10%';
    }
};

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

// Active nav link on scroll (simple + lightweight)
const setActiveNavLink = () => {
    const sections = document.querySelectorAll('main section[id]');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !links.length) return;

    const scrollPos = window.scrollY + 120;
    let activeId = null;
    sections.forEach(sec => {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) activeId = sec.id;
    });

    links.forEach(a => {
        const href = a.getAttribute('href') || '';
        const isActive = activeId && href === `#${activeId}`;
        a.classList.toggle('is-active', Boolean(isActive));
    });
};
window.addEventListener('load', setActiveNavLink);

// Background parallax (subtle)
const updateParallax = () => {
    if (prefersReducedMotion()) return;
    const shift = Math.max(-40, Math.min(40, window.scrollY * 0.03));
    document.documentElement.style.setProperty('--bg-shift', `${shift}px`);
};
window.addEventListener('load', updateParallax);

// Single rAF scroll pipeline
let scrollTicking = false;
const runScrollPipeline = () => {
    updateNavbar();
    setActiveNavLink();
    updateParallax();
    scrollTicking = false;
};
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(runScrollPipeline);
}, { passive: true });

// Magnetic hover (buttons/chips)
const magneticEls = () => Array.from(document.querySelectorAll('.btn, .chip, .icon-btn, .resume-btn'));
const enableMagnetic = () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    magneticEls().forEach(el => {
        el.classList.add('magnetic');
        let rect = null;
        const strength = 0.18;

        const onEnter = () => { rect = el.getBoundingClientRect(); };
        const onMove = (e) => {
            if (!rect) rect = el.getBoundingClientRect();
            const mx = e.clientX - (rect.left + rect.width / 2);
            const my = e.clientY - (rect.top + rect.height / 2);
            el.style.transform = `translate3d(${mx * strength}px, ${my * strength}px, 0)`;
        };
        const onLeave = () => {
            rect = null;
            el.style.transform = '';
        };

        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mousemove', onMove, { passive: true });
        el.addEventListener('mouseleave', onLeave);
    });
};
window.addEventListener('load', enableMagnetic);

// 3D tilt cards (projects + skill cards) + shine
const tiltCards = () => Array.from(document.querySelectorAll('.project-card, .skill-category'));
const enableTilt = () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    tiltCards().forEach(card => {
        if (card.querySelector('.tilt-shine') == null) {
            const shine = document.createElement('div');
            shine.className = 'tilt-shine';
            card.appendChild(shine);
        }
        let rect = null;
        const max = 10;
        const shine = card.querySelector('.tilt-shine');

        const onEnter = () => { rect = card.getBoundingClientRect(); };
        const onMove = (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rx = (py - 0.5) * -max;
            const ry = (px - 0.5) * max;
            card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
            if (shine) {
                shine.style.setProperty('--mx', `${px * 100}%`);
                shine.style.setProperty('--my', `${py * 100}%`);
            }
        };
        const onLeave = () => {
            rect = null;
            card.style.transform = '';
        };

        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mousemove', onMove, { passive: true });
        card.addEventListener('mouseleave', onLeave);
    });
};
window.addEventListener('load', enableTilt);

// Hero typing + glitch micro-burst (first load)
const runHeroFx = () => {
    if (prefersReducedMotion()) return;
    const subtitle = document.getElementById('hero-subtitle');
    const title = document.getElementById('hero-title');
    if (title) {
        title.setAttribute('data-text', title.textContent.trim());
        title.classList.add('glitch');
        setTimeout(() => title.classList.remove('glitch'), 650);
    }
    if (!subtitle) return;
    const full = subtitle.getAttribute('data-typing') || subtitle.textContent || '';
    subtitle.textContent = '';
    let i = 0;
    const tick = () => {
        i += 1;
        subtitle.textContent = full.slice(0, i);
        if (i < full.length) requestAnimationFrame(tick);
    };
    // start after reveal begins
    setTimeout(() => requestAnimationFrame(tick), 350);
};
window.addEventListener('load', runHeroFx);

// Latest GitHub projects (public API, no key)
const GITHUB_USERNAME = 'mraayush979blip';
const githubGrid = document.getElementById('github-projects-grid');
const githubStatus = document.getElementById('github-projects-status');
const projectSearch = document.getElementById('project-search');

const formatCompactDate = (iso) => {
    try {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' }).format(new Date(iso));
    } catch {
        return '';
    }
};

const safeText = (value) => (typeof value === 'string' ? value : '');

const renderGithubSkeleton = (count = 4) => {
    if (!githubGrid) return;
    githubGrid.innerHTML = Array.from({ length: count }).map(() => `
        <div class="project-card reveal active skeleton" aria-hidden="true">
            <div class="project-info">
                <h3 style="opacity:0">Loading</h3>
                <p style="opacity:0">Loading</p>
                <p style="opacity:0">Loading</p>
            </div>
        </div>
    `).join('');
};

const renderGithubRepos = (repos) => {
    if (!githubGrid) return;
    githubGrid.innerHTML = repos.map(repo => {
        const name = safeText(repo.name);
        const desc = safeText(repo.description) || 'No description yet.';
        const url = safeText(repo.html_url);
        const homepage = safeText(repo.homepage);
        const lang = safeText(repo.language);
        const stars = Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0;
        const updated = safeText(repo.updated_at);
        const updatedLabel = updated ? formatCompactDate(updated) : '';

        const metaBits = [
            lang ? `<span><i data-lucide="code"></i>${lang}</span>` : '',
            `<span><i data-lucide="star"></i>${stars}</span>`,
            updatedLabel ? `<span><i data-lucide="clock"></i>${updatedLabel}</span>` : ''
        ].filter(Boolean).join('');

        const actions = [
            url ? `<a href="${url}" target="_blank" rel="noreferrer" class="btn secondary" style="padding: 8px 15px; font-size: 0.9em; text-decoration: none;">Code</a>` : '',
            homepage ? `<a href="${homepage}" target="_blank" rel="noreferrer" class="btn primary" style="padding: 8px 15px; font-size: 0.9em; text-decoration: none;">Live</a>` : ''
        ].filter(Boolean).join('');

        return `
            <div class="project-card reveal active">
                <div class="project-info">
                    <h3>${name}</h3>
                    <p>${desc}</p>
                    <div class="project-meta">${metaBits}</div>
                    <div class="project-actions">${actions}</div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
};

const loadGithubRepos = async () => {
    if (!githubGrid) return;
    if (githubStatus) githubStatus.textContent = '';
    renderGithubSkeleton(4);

    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=8&sort=updated`, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!res.ok) throw new Error(`GitHub API error (${res.status})`);

        const data = await res.json();
        const repos = Array.isArray(data) ? data : [];
        const filtered = repos
            .filter(r => r && !r.fork)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 6);

        if (!filtered.length) {
            githubGrid.innerHTML = '';
            if (githubStatus) githubStatus.textContent = 'No public repositories found to display.';
            return;
        }

        renderGithubRepos(filtered);
        if (githubStatus) githubStatus.textContent = `Showing ${filtered.length} recently updated repositories.`;
    } catch (err) {
        githubGrid.innerHTML = '';
        if (githubStatus) githubStatus.textContent = 'Could not load GitHub projects right now. Please try again later.';
    }
};

window.addEventListener('load', loadGithubRepos);

// Featured projects filter + search
const featuredCards = () => Array.from(document.querySelectorAll('#projects .projects-grid > .project-card'));
const normalize = (s) => (s || '').toString().trim().toLowerCase();

const applyProjectFilters = () => {
    const cards = featuredCards();
    if (!cards.length) return;

    const activeChip = document.querySelector('.chip-row .chip.is-active');
    const filter = activeChip ? activeChip.dataset.filter : 'all';
    const q = normalize(projectSearch ? projectSearch.value : '');

    let visible = 0;
    cards.forEach(card => {
        const tags = normalize(card.getAttribute('data-tags'));
        const text = normalize(card.innerText);
        const matchTag = filter === 'all' ? true : tags.includes(filter);
        const matchQuery = !q ? true : text.includes(q);
        const show = matchTag && matchQuery;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
    });

    const status = document.getElementById('github-projects-status');
    if (status && (filter !== 'all' || q)) {
        status.textContent = `Filtered featured projects: showing ${visible}.`;
    }
};

document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('.chip-row .chip') : null;
    if (!btn) return;
    document.querySelectorAll('.chip-row .chip').forEach(c => {
        c.classList.toggle('is-active', c === btn);
        c.setAttribute('aria-selected', c === btn ? 'true' : 'false');
    });
    applyProjectFilters();
});

if (projectSearch) {
    projectSearch.addEventListener('input', applyProjectFilters, { passive: true });
    window.addEventListener('load', applyProjectFilters);
}

// Case study modal (accessible dialog)
const caseModal = document.getElementById('case-modal');
const caseModalContent = document.getElementById('case-modal-content');
let lastFocusEl = null;

const CASE_STUDIES = {
    'LevelOne DSA': {
        problem: 'Students needed a single, structured place to learn DSA with practice + progress tracking.',
        approach: ['Designed a clear course structure with curated lectures + problems.', 'Used Supabase for auth/data and fast iteration.', 'Optimized UX for daily practice (quick resume + progress).'],
        results: ['Used by 100+ students.', 'Faster onboarding with structured curriculum.'],
        tech: ['Next.js', 'Tailwind', 'Supabase']
    },
    'Acropolis Attendance Management System': {
        problem: 'Manual attendance marking caused errors and slow reporting.',
        approach: ['Built role-based access for faculty/admin.', 'Added real-time attendance workflow with audit-friendly data.', 'Automated reporting to reduce admin overhead.'],
        results: ['Approved and live for 3rd Year IT department.', 'Reduced administrative errors.'],
        tech: ['React', 'Node.js', 'Firebase']
    },
    'LevelOne WebDev': {
        problem: 'Learners needed project-based modules aligned with industry-ready standards.',
        approach: ['Created interactive modules and project roadmaps.', 'Kept content editable and scalable.', 'Focused on outcomes and practical builds.'],
        results: ['Integrated into LevelOne suite for placement roadmap.'],
        tech: ['Next.js', 'Markdown', 'Framer Motion']
    },
    'GapShap AI': {
        problem: 'Showcase low-latency AI chat with persona-based experiences.',
        approach: ['Built chat UI and persona prompts.', 'Integrated LLM provider for fast responses.', 'Used Supabase to support real-time app structure.'],
        results: ['Demonstrates modern AI integration with real-time architecture.'],
        tech: ['React', 'Groq Cloud', 'Supabase']
    },
    'Shree Shyam Kunj Living Hub': {
        problem: 'Real estate brand needed a premium lead-gen portal with strong visuals.',
        approach: ['Designed listing UX with amenities/floor plans focus.', 'Optimized for conversions with clear CTAs.', 'Used Cloudinary-style asset delivery patterns.'],
        results: ['Improved digital presence and customer engagement.'],
        tech: ['Next.js', 'Tailwind', 'Cloudinary']
    }
};

const openCaseModal = (title) => {
    if (!caseModal || !caseModalContent) return;
    const data = CASE_STUDIES[title];
    if (!data) return;

    lastFocusEl = document.activeElement;
    caseModalContent.innerHTML = `
        <h3 class="case-title">${title}</h3>
        <div class="case-grid">
            <div>
                <h4>Problem</h4>
                <p>${data.problem}</p>
            </div>
            <div>
                <h4>Approach</h4>
                <ul>${data.approach.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div>
                <h4>Results</h4>
                <ul>${data.results.map(x => `<li>${x}</li>`).join('')}</ul>
            </div>
            <div>
                <h4>Tech</h4>
                <div class="skill-tags">${data.tech.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
        </div>
    `;

    if (typeof caseModal.showModal === 'function') {
        caseModal.showModal();
    } else {
        caseModal.setAttribute('open', '');
    }

    const closeBtn = caseModal.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.focus();
    if (window.lucide) lucide.createIcons();
};

const closeCaseModal = () => {
    if (!caseModal) return;
    if (typeof caseModal.close === 'function') caseModal.close();
    else caseModal.removeAttribute('open');
    if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus();
};

document.addEventListener('click', (e) => {
    const openBtn = e.target && e.target.closest ? e.target.closest('.js-open-case') : null;
    if (openBtn) {
        const card = openBtn.closest('.project-card');
        const titleEl = card ? card.querySelector('h3') : null;
        const title = titleEl ? titleEl.textContent.trim() : '';
        openCaseModal(title);
        return;
    }

    const closeBtn = e.target && e.target.closest ? e.target.closest('[data-close-modal]') : null;
    if (closeBtn) closeCaseModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseModal && caseModal.open) closeCaseModal();
});

if (caseModal) {
    caseModal.addEventListener('click', (e) => {
        const inner = caseModal.querySelector('.case-modal__inner');
        if (inner && !inner.contains(e.target)) closeCaseModal();
    });
}

// Contact form submit (configurable endpoint; fallback to mailto)
const CONTACT_ENDPOINT = ''; // e.g. "https://formspree.io/f/xxxxxx" or your own API URL
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

const setContactStatus = (msg) => {
    if (contactStatus) contactStatus.textContent = msg;
};

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(contactForm);
        const payload = {
            name: safeText(fd.get('name')),
            email: safeText(fd.get('email')),
            message: safeText(fd.get('message'))
        };

        if (!payload.name || !payload.email || !payload.message) {
            setContactStatus('Please fill in all fields.');
            return;
        }

        // If no endpoint configured, fallback to email client.
        if (!CONTACT_ENDPOINT) {
            const subject = encodeURIComponent(`Portfolio message from ${payload.name}`);
            const body = encodeURIComponent(`${payload.message}\n\nFrom: ${payload.name}\nEmail: ${payload.email}`);
            window.location.href = `mailto:mraayush979@gmail.com?subject=${subject}&body=${body}`;
            return;
        }

        setContactStatus('Sending…');
        try {
            const res = await fetch(CONTACT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Send failed');
            contactForm.reset();
            setContactStatus('Message sent. Thank you!');
        } catch {
            setContactStatus('Could not send right now. Please use “Email instead”.');
        }
    });
}
