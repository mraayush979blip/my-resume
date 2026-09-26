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

// Reveal Animations (High performance & instantaneous on scroll)
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
    });
}, { root: null, rootMargin: '0px 0px 250px 0px', threshold: 0.01 });
revealElements.forEach(el => revealObserver.observe(el));

// Navbar scroll effect
const nav = document.querySelector('nav');
const updateNavbar = () => {
    if (!nav) return;
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
};

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            mobileMenuBtn.innerHTML = '<i data-lucide="x"></i>';
        } else {
            mobileMenuBtn.innerHTML = '<i data-lucide="menu"></i>';
        }
        lucide.createIcons();
    });
}

const mobileCloseBtn = document.getElementById('mobile-close-btn');
if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (mobileMenuBtn) {
            mobileMenuBtn.innerHTML = '<i data-lucide="menu"></i>';
        }
        lucide.createIcons();
    });
}

// Close mobile menu when link is clicked
const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i data-lucide="menu"></i>';
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

// 3D tilt cards (rAF throttled & high performance)
const tiltCards = () => Array.from(document.querySelectorAll('.project-card, .skill-category, .insight-card, .linkedin-creator-card'));
const enableTilt = () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    tiltCards().forEach(card => {
        if (card.querySelector('.tilt-shine') == null) {
            const shine = document.createElement('div');
            shine.className = 'tilt-shine';
            card.appendChild(shine);
        }
        let rect = null;
        const max = 7;
        const shine = card.querySelector('.tilt-shine');
        let ticking = false;

        const onEnter = () => {
            rect = card.getBoundingClientRect();
            card.style.transition = 'none';
        };
        const onMove = (e) => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                if (!rect) rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                const rx = (py - 0.5) * -max;
                const ry = (px - 0.5) * max;
                card.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
                if (shine) {
                    shine.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
                    shine.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
                }
                ticking = false;
            });
        };
        const onLeave = () => {
            rect = null;
            card.style.transform = '';
            card.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.25s ease, box-shadow 0.25s ease';
            ticking = false;
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
    'Mahaurja Renewables': {
        problem: 'Industrial manufacturing and boiler operations face escalating fossil fuel prices and stringent carbon emission regulations. While biomass pellets provide a sustainable alternative, plant managers often hesitate due to inconsistent calorific value (GCV), moisture variations, and uncertain return on investment. Furthermore, procurement teams span corporate executives and regional ground managers who require information in both English and Hindi.',
        approach: [
            'Engineered Technical Matrix: Developed an interactive specification grid highlighting Mahaurja\'s custom pellet engineering (target 5,000+ kcal/kg GCV, low ash, controlled moisture) compared to generic standard fuel.',
            'Real-Time Financial Modeling: Built an intuitive ROI estimator using Framer Motion and dynamic sliders, enabling prospective clients to visualize immediate monthly fuel expenditure cuts and annualized CO₂ tonnage offset.',
            'Dynamic Localization & RFQ Funnel: Engineered a zero-latency i18n translation system supporting Hindi and English alongside an industry-specific RFQ form capturing boiler types, pellet sizes (6mm/8mm/10mm), and delivery schedules.',
            'Cinematic & Modern B2B Brand Identity: Built a modern, green industrial aesthetic using Tailwind CSS v4, custom SVG flow connectors, and optimized video background loops without compromising initial page load speed.'
        ],
        results: [
            '36,000+ MT / Year Capacity Showcased: Built a digital presence representing a 120 Tons Per Day industrial facility across a 200,000+ sq. ft. plant footprint.',
            'Interactive Real-Time ROI Engine: Allows plant managers to instantly calculate up to 72% fuel cost savings and annual CO₂ reductions switching from coal, diesel, and gas.',
            'Full Bilingual Reach (EN / HI): Integrated English and Hindi localization without page reloads to cater to both corporate buyers and regional plant procurement teams.',
            'Sub-Second Performance & SEO: Near-perfect Core Web Vitals with lazy-loaded video, Next.js image optimization, and full Schema.org microdata for industrial search ranking.'
        ],
        tech: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion', 'i18n Engine']
    },
    'Petricor': {
        problem: 'The international botanical extracts and herbal supplements market is plagued by opaque supply chains, multi-tier broker markups, and unverified ingredient authenticity. International pharmaceutical and nutraceutical buyers often struggle with delayed quotation cycles, lack of HPLC-quantified proof of active compounds, and cumbersome paperwork compliance for cross-border customs (IEC, FSSAI, Phytosanitary, CoA).',
        approach: [
            'Direct-From-Source Digital Presence: Designed an authoritative UI emphasizing farm-origin transparency in Neemuch, India, with real-time compliance credentials and interactive category exploration.',
            'Modern Full-Stack Engineering: Developed with React 19, TypeScript, and Vite backed by Supabase. Implemented structured JSON-LD schemas and responsive scaling for ultrawide and mobile viewports.',
            'Automated Lead & Security Pipeline: Built a multi-step RFQ modal protected by Google reCAPTCHA v3, instantly routing structured buyer requirements via Supabase Edge Functions.',
            'Enterprise Admin Dashboard: Created a secured internal admin panel (/ad) allowing operations teams to track active enquiries, update product specs, manage image uploads with browser-based cropping, and monitor system health.'
        ],
        results: [
            'Successfully deployed into live production on Vercel.',
            'Eliminated broker intermediaries by directly linking global herbal importers to source-verified Indian farmers and processing units.',
            'Accelerated inquiry-to-sample turnaround times while delivering full regulatory compliance out of the box.'
        ],
        tech: ['React 19', 'TypeScript', 'Vite', 'Supabase', 'PostgreSQL', 'Edge Functions', 'Framer Motion', 'Lenis', 'PWA']
    },
    'LevelOne DSA': {
        problem: 'Traditional DSA courses and video playlists suffer from passive watching, tutorial hell, and <10% completion rates without active coding accountability.',
        approach: [
            'Engineered a phase-gated DSA curriculum requiring verified problem submissions, test suite passes, and GitHub tracking before unlocking advanced algorithmic modules.',
            'Integrated a context-aware AI tutor powered by Google Gemini API and Groq SDK to provide hint-based Socratic debugging without spoon-feeding answers.',
            'Built 30-second heartbeat activity telemetry to monitor real student problem-solving time and code editor engagement.',
            'Architected automated role-based cohort gating, end-to-end Razorpay checkout, and an organic referral system.'
        ],
        results: [
            '350+ Enrolled active students with high completion rates.',
            'Automated role-based access control and verified milestone progression.',
            'Live telemetry with continuous real-time learner engagement feedback.'
        ],
        tech: ['Next.js 15', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Google Gemini API', 'Groq SDK', 'Razorpay', 'Framer Motion', 'Firebase PWA']
    },
    'Acropolis Attendance Management System': {
        problem: 'Manual attendance roll calls and physical paper registers caused delays, audit inaccuracies, and labor-intensive reporting for faculty.',
        approach: [
            'Built strict role-based access control (RBAC) separating faculty, student coordinators, and department administrators.',
            'Engineered a real-time attendance logging workflow with instant daily audit summaries and automated reporting.',
            'Optimized data synchronization to prevent record tampering and administrative discrepancy.'
        ],
        results: [
            'Approved and deployed live in production across both the IT Department and CSIT Department.',
            'Eliminated physical attendance log inaccuracies and accelerated weekly attendance audit cycles.',
            'Awarded an official Certificate of Appreciation by Dr. Prashant Lakkadwala (HOD - IT).'
        ],
        tech: ['React', 'Node.js', 'Firebase', 'Role-Based Auth']
    },
    'GoCanteen': {
        problem: 'University food courts and campus canteens experience massive bursts of footfall during short 30-minute lunch breaks. Manual ordering counters create long queues, order delays, cash-handling discrepancies, and stock-outs where canteens accidentally oversell fast-moving items.',
        approach: [
            'Tri-Portal Architecture: Engineered a unified system with role-based routing (PortalGuard) separating Student/Customer (menu browsing, discount coupons, cart), Kitchen Staff (live Kitchen Display System & POS), and Admin (inventory, sales analytics, multi-outlet management).',
            'Instant Mobile Payments: Integrated Razorpay with native mobile UPI intents (Google Pay, PhonePe, Paytm) and automated platform fee separation for frictionless mobile checkout.',
            'Real-Time Data Pipeline: Leveraged Supabase (PostgreSQL with Row Level Security and Realtime subscriptions) to broadcast orders directly to the kitchen display screen without polling.',
            'Mobile-First UX: Built as a responsive PWA using React 19, Framer Motion, and Lenis smooth scrolling with persistent query caching (@tanstack/react-query-persist-client) to prevent mobile GPU stutter during rapid scroll.'
        ],
        results: [
            'Turned physical canteen counters into exclusive grab-and-go pickup stations, clearing the lunch break bottleneck.',
            'Eliminated paper ticket errors and counter confusion through digital KDS order tracking.',
            'Provided canteen managers with complete real-time inventory control and revenue visibility with zero platform commission.'
        ],
        tech: ['React 19', 'Supabase', 'Tailwind CSS', 'Razorpay', 'PostgreSQL RLS', 'Framer Motion', 'Lenis', 'PWA']
    },
    'Go Canteen': {
        problem: 'University food courts and campus canteens experience massive bursts of footfall during short 30-minute lunch breaks. Manual ordering counters create long queues, order delays, cash-handling discrepancies, and stock-outs where canteens accidentally oversell fast-moving items.',
        approach: [
            'Tri-Portal Architecture: Engineered a unified system with role-based routing (PortalGuard) separating Student/Customer, Kitchen Staff (live KDS & POS), and Admin (inventory, analytics, multi-outlet management).',
            'Instant Mobile Payments: Integrated Razorpay with native mobile UPI intents (Google Pay, PhonePe, Paytm) and automated platform fee separation.',
            'Real-Time Data Pipeline: Leveraged Supabase (PostgreSQL with Row Level Security and Realtime subscriptions) to broadcast orders directly to the kitchen display screen without polling.',
            'Mobile-First UX: Built as a responsive PWA using React 19, Framer Motion, and Lenis smooth scrolling with persistent query caching.'
        ],
        results: [
            'Turned physical canteen counters into exclusive grab-and-go pickup stations, clearing the lunch break bottleneck.',
            'Eliminated paper ticket errors and counter confusion through digital KDS order tracking.',
            'Provided canteen managers with complete real-time inventory control and revenue visibility with zero platform commission.'
        ],
        tech: ['React 19', 'Supabase', 'Tailwind CSS', 'Razorpay', 'PostgreSQL RLS', 'Framer Motion', 'Lenis', 'PWA']
    },
    'LevelOne Dev': {
        problem: 'Traditional online courses suffer from <10% completion rates and passive skimming without real coding accountability.',
        approach: [
            'Engineered a phase-gated learning platform requiring verified video watch time (≥90%) and GitHub submission versioning before unlocking content.',
            'Integrated a context-aware AI tutor powered by Google Gemini API and Groq SDK for instant, personalized doubt resolution.',
            'Built 30-second heartbeat activity telemetry to track real student engagement and progress analytics.',
            'Architected automated role-based access gating, end-to-end Razorpay checkout, and an organic referral system.'
        ],
        results: [
            '350+ Enrolled active students with high completion rates.',
            'Automated role-based access control and verified milestone progression.',
            'Live telemetry with continuous real-time learner engagement feedback.'
        ],
        tech: ['Next.js 15', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Google Gemini API', 'Groq SDK', 'Razorpay', 'Framer Motion', 'Firebase PWA']
    },
    'LevelOne WebDev': {
        problem: 'Traditional online courses suffer from <10% completion rates and passive skimming without real coding accountability.',
        approach: [
            'Engineered a phase-gated learning platform requiring verified video watch time (≥90%) and GitHub submission versioning before unlocking content.',
            'Integrated a context-aware AI tutor powered by Google Gemini API and Groq SDK for instant, personalized doubt resolution.',
            'Built 30-second heartbeat activity telemetry to track real student engagement and progress analytics.',
            'Architected automated role-based access gating, end-to-end Razorpay checkout, and an organic referral system.'
        ],
        results: [
            '350+ Enrolled active students with high completion rates.',
            'Automated role-based access control and verified milestone progression.',
            'Live telemetry with continuous real-time learner engagement feedback.'
        ],
        tech: ['Next.js 15', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Google Gemini API', 'Groq SDK', 'Razorpay', 'Framer Motion', 'Firebase PWA']
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

    const showDOM = () => {
        if (typeof caseModal.showModal === 'function') {
            caseModal.showModal();
        } else {
            caseModal.setAttribute('open', '');
        }

        const closeBtn = caseModal.querySelector('[data-close-modal]');
        if (closeBtn) closeBtn.focus();
        if (window.lucide) lucide.createIcons();
    };

    if (!document.startViewTransition) {
        showDOM();
    } else {
        document.startViewTransition(() => showDOM());
    }
};

const closeCaseModal = () => {
    if (!caseModal) return;

    const hideDOM = () => {
        if (typeof caseModal.close === 'function') caseModal.close();
        else caseModal.removeAttribute('open');
        if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus();
    };

    if (!document.startViewTransition) {
        hideDOM();
    } else {
        const transition = document.startViewTransition(() => hideDOM());
        transition.finished.finally(() => {
            document.querySelectorAll('.morph-active').forEach(c => c.classList.remove('morph-active'));
        });
    }
};

document.addEventListener('click', (e) => {
    const openBtn = e.target && e.target.closest ? e.target.closest('.js-open-case') : null;
    if (openBtn) {
        const card = openBtn.closest('.project-card');
        const titleEl = card ? card.querySelector('h3') : null;
        const title = titleEl ? titleEl.textContent.trim() : '';
        if (card) {
            document.querySelectorAll('.morph-active').forEach(c => c.classList.remove('morph-active'));
            card.classList.add('morph-active');
        }
        openCaseModal(title);
        return;
    }

    // Mobile compact card: tapping anywhere on a project card navigates directly to its dedicated subpage
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const card = e.target && e.target.closest ? e.target.closest('#projects .projects-grid > .project-card') : null;
        if (card) {
            const subpage = card.dataset.subpage || (card.querySelector('.mobile-project-card-link') ? card.querySelector('.mobile-project-card-link').getAttribute('href') : null);
            if (subpage) {
                window.location.href = subpage;
                return;
            }
        }
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
