// Call lucide.createIcons() immediately since scripts are at bottom of HTML
if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', function() {

            // Theme Toggle Functionality
            const themeToggle = document.getElementById('themeToggle');
            const htmlElement = document.documentElement;
            let currentTileLayer = null;

            // Check for saved theme preference or default to user's system preference
            const getPreferredTheme = () => {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme) {
                    return savedTheme;
                }
                return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
            };

            // Set theme
            const setTheme = (theme) => {
                htmlElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);

                // Update nav-header data-theme if scrolled past hero
                const navHeader = document.querySelector('.nav-header');
                if (navHeader && navHeader.classList.contains('scrolled-past-hero')) {
                    navHeader.setAttribute('data-theme', theme);
                }

                // Update logo based on theme and scroll position
                updateLogoAndBurger();

                // Update map tiles if map exists
                if (window.mapInstance && currentTileLayer) {
                    currentTileLayer.remove();
                    if (theme === 'light') {
                        currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                            attribution: '© OpenStreetMap contributors © CARTO',
                            subdomains: 'abcd',
                            maxZoom: 19
                        }).addTo(window.mapInstance);
                    } else {
                        currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                            attribution: '© OpenStreetMap contributors © CARTO',
                            subdomains: 'abcd',
                            maxZoom: 19
                        }).addTo(window.mapInstance);
                    }
                }
            };

            // Helper function to update logo - keep white at all times
            const updateLogoAndBurger = () => {
                const logo = document.getElementById('siteLogo');
                if (logo) {
                    // Always use white logo
                    logo.src = 'lts-logo-white.png';
                }
            };

            // Initialize theme
            setTheme(getPreferredTheme());

            // Theme toggle click handler
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);
                });
            }

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    setTheme(e.matches ? 'light' : 'dark');
                }
            });

            const hero = document.querySelector('.hero');
            const heroContent = document.getElementById('heroContent');
            const heroCompass = document.querySelector('.hero-scroll-compass');
            const navHeader = document.querySelector('.nav-header');
            const heroMediaVideos = document.querySelectorAll('.hero-video');
            const primaryHeroVideo = document.getElementById('heroPrimaryVideo');
            const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            const aiBtn = document.getElementById('aiConciergeBtn');

            const allowMotion = !prefersReducedMotionQuery.matches;
            let heroHasRevealed = false;
            let revealTimeoutId = null;

            let lastScrollY = window.scrollY;
            let scrollDirection = 'up';

            const updateNavPinnedState = () => {
                if (!navHeader) return;

                // If no hero element exists (inner pages), always show the header
                if (!hero) {
                    navHeader.classList.remove('pinned');
                    navHeader.classList.remove('hidden');
                    navHeader.classList.add('show');
                    return;
                }

                const currentScrollY = window.scrollY;
                // Determine scroll direction
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    scrollDirection = 'down';
                } else if (currentScrollY < lastScrollY) {
                    scrollDirection = 'up';
                }

                // Get hero height
                const heroHeight = hero.offsetHeight;
                const inHeroArea = currentScrollY < heroHeight;

                // Handle pinned state (when in hero area)
                if (inHeroArea) {
                    // In hero: no dark bar background
                    navHeader.classList.add('pinned');
                    navHeader.classList.add('hidden');
                    navHeader.classList.remove('show');
                } else {
                    // Outside hero: show dark bar and handle scroll behavior
                    navHeader.classList.remove('pinned');
                    navHeader.classList.add('show');

                    // Handle visibility based on scroll direction
                    if (scrollDirection === 'down' && currentScrollY > heroHeight + 50) {
                        // Scrolling down - hide header
                        navHeader.classList.add('hidden');
                    } else {
                        // Scrolling up or just left hero - show header
                        navHeader.classList.remove('hidden');
                    }
                }

                lastScrollY = currentScrollY;
            };

            const applyMotionPreference = (allowAnimation) => {
                if (!hero) return;

                if (!allowAnimation) {
                    hero.classList.add('reduced-motion');
                    heroMediaVideos.forEach(video => {
                        video.pause();
                        video.removeAttribute('autoplay');
                        video.classList.add('is-paused');
                    });
                } else {
                    hero.classList.remove('reduced-motion');
                    heroMediaVideos.forEach(video => {
                        video.classList.remove('is-paused');
                        video.muted = true;
                        const playPromise = video.play();
                        if (playPromise && typeof playPromise.catch === 'function') {
                            playPromise.catch(() => {
                                video.classList.add('is-paused');
                            });
                        }
                    });
                }
            };

            applyMotionPreference(allowMotion);

            const handleMotionPreferenceChange = (event) => {
                applyMotionPreference(!event.matches);
            };

            if (prefersReducedMotionQuery.addEventListener) {
                prefersReducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
            } else if (prefersReducedMotionQuery.addListener) {
                prefersReducedMotionQuery.addListener(handleMotionPreferenceChange);
            }

            if (heroMediaVideos && heroMediaVideos.length > 0) {
                heroMediaVideos.forEach(video => {
                    video.addEventListener('error', () => {
                        video.classList.add('is-paused');
                        hero?.classList.add('reduced-motion');
                    });
                });
            }

            const revealHero = () => {
                if (heroHasRevealed) return;
                heroHasRevealed = true;
                hero?.setAttribute('data-reveal', 'true');
                heroContent?.classList.add('show');
                heroCompass?.classList.add('show');
                navHeader?.classList.add('show');
                aiBtn?.classList.add('show');
                updateNavPinnedState();
            };

            const scheduleHeroReveal = (delay = 2200) => {
                if (heroHasRevealed) return;
                if (revealTimeoutId) {
                    clearTimeout(revealTimeoutId);
                }
                revealTimeoutId = window.setTimeout(revealHero, delay);
            };

            if (primaryHeroVideo) {
                primaryHeroVideo.addEventListener('playing', () => {
                    scheduleHeroReveal(1800);
                });
                primaryHeroVideo.addEventListener('loadeddata', () => {
                    scheduleHeroReveal(2000);
                });
                primaryHeroVideo.addEventListener('error', revealHero);
            } else {
                scheduleHeroReveal(2200);
            }

            scheduleHeroReveal(2800);

            // Initialize nav header state (for both hero and non-hero pages)
            updateNavPinnedState();

            if (hero) {
                let ticking = false;
                const onScroll = () => {
                    if (!ticking) {
                        window.requestAnimationFrame(() => {
                            updateNavPinnedState();
                            ticking = false;
                        });
                        ticking = true;
                    }
                };

                window.addEventListener('scroll', onScroll, { passive: true });
                window.addEventListener('resize', updateNavPinnedState);
            } else {
                // For pages without hero, also show AI button immediately
                aiBtn?.classList.add('show');
            }

            const primaryCta = document.querySelector('.hero-cta.primary');
            if (primaryCta) {
                primaryCta.addEventListener('click', (event) => {
                    const href = primaryCta.getAttribute('href');
                    if (!href || !href.startsWith('#')) {
                        return;
                    }

                    const target = document.getElementById(href.substring(1));
                    if (target) {
                        event.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            }

            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const navMenu = document.querySelector('.nav-menu');
            const navLinks = document.querySelectorAll('.nav-menu a');

            if (mobileToggle && navMenu) {
                navMenu.setAttribute('aria-hidden', 'true');

                const closeMenu = (returnFocus = false) => {
                    navMenu.classList.remove('open');
                    mobileToggle.classList.remove('is-open');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    mobileToggle.setAttribute('aria-label', 'Open menu');
                    mobileToggle.textContent = 'MENU';
                    navMenu.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('nav-open');
                    updateLogoAndBurger();
                    if (returnFocus) {
                        mobileToggle.focus();
                    }
                };

                const toggleMenu = () => {
                    const isOpen = navMenu.classList.toggle('open');
                    mobileToggle.classList.toggle('is-open', isOpen);
                    mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                    mobileToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
                    mobileToggle.textContent = isOpen ? '×' : 'MENU';
                    navMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
                    document.body.classList.toggle('nav-open', isOpen);
                    updateLogoAndBurger();
                    if (isOpen) {
                        navLinks[0]?.focus();
                    } else {
                        mobileToggle.focus();
                    }
                };

                mobileToggle.addEventListener('click', () => {
                    toggleMenu();
                });

                navLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        closeMenu();
                    });
                });

                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape' && navMenu.classList.contains('open')) {
                        closeMenu(true);
                    }
                });
            }

            // AI Concierge functionality
            const chatOverlay = document.getElementById('chatOverlay');
            const closeChat = document.getElementById('closeChat');
            const chatInput = document.getElementById('chatInput');
            const sendButton = document.getElementById('sendButton');
            const chatMessages = document.getElementById('chatMessages');
            const livTriggers = document.querySelectorAll('[data-open-liv]');
            const enquiryTriggers = document.querySelectorAll('[data-open-enquiry]');
            const enquiryForm = document.getElementById('enquiryForm');
            const enquiryTripType = document.getElementById('enquiryTripType');
            const enquiryDetails = document.getElementById('enquiryDetails');
            const itineraryDraftField = document.getElementById('itineraryDraftField');
            const enquiryStatus = document.getElementById('enquiryStatus');
            const enquiryName = document.getElementById('enquiryName');
            const enquiryEmail = document.getElementById('enquiryEmail');
            const enquirySourceField = document.getElementById('enquirySourceField');
            const enquiryDates = document.getElementById('enquiryDates');

            const LIV_THEME_LIBRARY = [
                { label: 'Hidden Nature & Wellness', keywords: ['nature', 'forest', 'wellness', 'spa', 'silence', 'lapland'], highlight: 'I’ll escort you north to glass-roof lodges in Lapland, where aurora vigils, private sauna rituals, and forest bathing reset every sense.' },
                { label: 'Design & Innovation', keywords: ['design', 'innovation', 'studio', 'architecture', 'tech', 'creative'], highlight: 'Stockholm’s design houses unlock after-hours, with studio salons and conversations alongside Sweden’s pioneering innovators.' },
                { label: 'Culinary & Storytelling', keywords: ['culinary', 'food', 'gastronomy', 'chef', 'dining', 'story'], highlight: 'Chefs compose narrative tasting menus aboard an archipelago yacht, threading local producers and storytellers into each course.' },
                { label: 'Royal & Heritage', keywords: ['royal', 'heritage', 'palace', 'history', 'ancestral'], highlight: 'After-hours access to royal palaces and ancestral estates reveals chambers typically reserved for dignitaries and lineage keepers.' },
                { label: 'Art & Culture', keywords: ['art', 'culture', 'gallery', 'artist', 'performance'], highlight: 'Private gallery circuits, rehearsal previews, and atelier visits place you inside Sweden’s contemporary cultural movement.' },
                { label: 'Nightlife & Celebrations', keywords: ['nightlife', 'celebration', 'party', 'gala', 'club'], highlight: 'Underground speakeasies, bespoke gala choreography, and avant-garde performances ignite nights that stretch toward dawn.' },
                { label: 'Legacy & Meaningful Travel', keywords: ['legacy', 'impact', 'meaningful', 'philanthropy', 'sustainability'], highlight: 'Impact encounters connect you with sustainability founders and cultural guardians shaping Sweden’s future.' }
            ];

            const livSteps = [
                {
                    id: 'tripType',
                    question: 'Tell me, is this a private FIT journey or a corporate experience?',
                    options: [
                        { label: 'Private Journey', value: 'FIT' },
                        { label: 'Corporate Gathering', value: 'Corporate' }
                    ]
                },
                {
                    id: 'themes',
                    question: 'Which themes should I weave in? Think Hidden Nature & Wellness, Design & Innovation, Culinary & Storytelling, Royal & Heritage, Art & Culture, Nightlife & Celebrations, Legacy & Meaningful Travel.'
                },
                {
                    id: 'duration',
                    question: 'How many nights shall we compose for this journey?'
                },
                {
                    id: 'groupSize',
                    question: 'Who’s travelling with you, and roughly how many guests?'
                },
                {
                    id: 'season',
                    question: 'Do you have a preferred season or exact dates in mind?'
                },
                {
                    id: 'wishes',
                    question: 'Any special wishes — private jet, yacht, chef, backstage access, cultural icons?'
                }
            ];

            const YES_RESPONSES = ['yes', 'y', 'sure', 'please', 'connect', 'confirm', 'definitely', 'absolutely'];
            const NO_RESPONSES = ['no', 'not yet', 'later', 'refine', 'adjust', 'tweak'];

            const livConversation = {
                started: false,
                stepIndex: 0,
                awaitingConfirmation: false,
                expectingRefinement: false,
                answers: {},
                itineraryDraft: '',
                summary: '',
                context: null  // Will store context from entry point
            };

            function appendMessage(role, text, config = {}) {
                if (!chatMessages) return;
                const { options = null, stepId = null, delay = 0 } = config;
                const render = () => {
                    const messageEl = document.createElement('div');
                    messageEl.classList.add('chat-message', role);
                    const fragments = Array.isArray(text) ? text : [text];
                    fragments.forEach(fragment => {
                        if (!fragment) return;
                        const paragraph = document.createElement('p');
                        paragraph.textContent = fragment;
                        messageEl.appendChild(paragraph);
                    });

                    if (options && options.length) {
                        const optionsContainer = document.createElement('div');
                        optionsContainer.className = 'quick-replies';
                        if (stepId) {
                            optionsContainer.dataset.stepId = stepId;
                        }

                        options.forEach(option => {
                            const button = document.createElement('button');
                            button.type = 'button';
                            button.textContent = option.label;
                            button.addEventListener('click', () => {
                                if (button.disabled) return;
                                optionsContainer.classList.add('resolved');
                                optionsContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
                                setTimeout(() => optionsContainer.remove(), 220);
                                appendMessage('user', option.label);
                                processResponse(option.value);
                            });
                            optionsContainer.appendChild(button);
                        });

                        messageEl.appendChild(optionsContainer);
                    }

                    chatMessages.appendChild(messageEl);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                };

                if (delay) {
                    setTimeout(render, delay);
                } else {
                    render();
                }
            }

            function startConversation() {
                if (livConversation.started) return;
                livConversation.started = true;

                // Show personalized greeting based on context
                if (livConversation.context) {
                    const { type, name, greeting } = livConversation.context;
                    if (greeting) {
                        appendMessage('ai', greeting, { delay: 300 });
                        setTimeout(() => {
                            askCurrentStep();
                        }, 1500);
                        return;
                    }
                }

                // Default greeting if no context
                setTimeout(() => {
                    askCurrentStep();
                }, 900);
            }

            function askCurrentStep() {
                const step = livSteps[livConversation.stepIndex];
                if (!step) {
                    setTimeout(() => {
                        deliverItinerary();
                    }, 600);
                    return;
                }

                appendMessage('ai', step.question, {
                    options: step.options || null,
                    stepId: step.id,
                    delay: 350
                });
            }

            function handleTypedInput() {
                const message = chatInput.value.trim();
                if (!message) return;
                appendMessage('user', message);
                chatInput.value = '';
                processResponse(message);
            }

            function processResponse(rawValue) {
                const value = rawValue.trim();
                if (!value) return;

                if (!livConversation.started) {
                    livConversation.started = true;
                }

                if (livConversation.awaitingConfirmation) {
                    handleConfirmation(value);
                    return;
                }

                if (livConversation.expectingRefinement) {
                    livConversation.expectingRefinement = false;
                    livConversation.answers.wishes = livConversation.answers.wishes
                        ? `${livConversation.answers.wishes}; ${value}`
                        : value;
                    appendMessage('ai', 'Understood. Refining your narrative now.', { delay: 300 });
                    setTimeout(() => {
                        deliverItinerary(true);
                    }, 900);
                    return;
                }

                const step = livSteps[livConversation.stepIndex];
                if (!step) {
                    appendMessage('ai', 'I can continue refining or capture more wishes — just let me know.');
                    return;
                }

                recordAnswer(step, value);
                livConversation.stepIndex += 1;
                setTimeout(() => {
                    askCurrentStep();
                }, 600);
            }

            function recordAnswer(step, rawValue) {
                const trimmed = rawValue.trim();
                switch (step.id) {
                    case 'tripType':
                        livConversation.answers.tripType = normalizeTripType(trimmed);
                        break;
                    case 'themes':
                        livConversation.answers.themes = extractThemes(trimmed);
                        break;
                    case 'duration':
                        livConversation.answers.duration = trimmed;
                        break;
                    case 'groupSize':
                        livConversation.answers.groupSize = trimmed;
                        break;
                    case 'season':
                        livConversation.answers.season = trimmed;
                        break;
                    case 'wishes':
                        livConversation.answers.wishes = trimmed;
                        break;
                    default:
                        break;
                }
            }

            function normalizeTripType(raw) {
                const normalized = raw.toLowerCase();
                if (normalized.includes('corporate') || normalized.includes('team') || normalized.includes('incentive') || normalized.includes('retreat')) {
                    return 'Corporate';
                }
                return 'FIT';
            }

            function extractThemes(raw) {
                if (!raw) return [];
                const normalized = raw.toLowerCase();
                const selections = [];

                LIV_THEME_LIBRARY.forEach(theme => {
                    const directMatch = normalized.includes(theme.label.toLowerCase());
                    const keywordMatch = theme.keywords.some(keyword => normalized.includes(keyword));
                    if ((directMatch || keywordMatch) && !selections.includes(theme.label)) {
                        selections.push(theme.label);
                    }
                });

                if (!selections.length) {
                    const parts = raw.split(/[,/&]|\band\b/gi).map(part => part.trim()).filter(Boolean);
                    return parts.length ? parts : [raw];
                }

                return selections;
            }

            function deliverItinerary(isRefinement = false) {
                const { paragraphs, summary } = buildItineraryDraft(livConversation.answers);
                livConversation.itineraryDraft = paragraphs.join('\n\n');
                livConversation.summary = summary;

                paragraphs.forEach((paragraph, index) => {
                    appendMessage('ai', paragraph, { delay: index * 420 });
                });

                const promptDelay = paragraphs.length * 420 + 320;
                appendMessage('ai', 'Shall I pass this draft to one of our human curators?', {
                    options: [
                        { label: 'Yes, connect me', value: 'yes' },
                        { label: 'Let’s refine', value: 'refine' }
                    ],
                    stepId: 'handoff',
                    delay: promptDelay
                });

                livConversation.awaitingConfirmation = true;
                if (isRefinement) {
                    livConversation.expectingRefinement = false;
                }
            }

            function buildItineraryDraft(answers) {
                const tripType = answers.tripType === 'Corporate' ? 'Corporate' : 'FIT';
                const duration = answers.duration || 'seven-night';
                const seasonRaw = (answers.season && answers.season.trim()) || 'your preferred season';
                const group = answers.groupSize || (tripType === 'Corporate' ? 'your leadership collective' : 'your inner circle');
                const themes = (answers.themes && answers.themes.length ? answers.themes : ['Design & Innovation', 'Hidden Nature & Wellness']).slice(0, 3);
                const wishes = answers.wishes || 'discreet concierge support throughout';

                const mappedThemes = themes.map(theme => {
                    const match = LIV_THEME_LIBRARY.find(item => item.label === theme);
                    return match ? match : { label: theme, highlight: `${theme} moments woven through Sweden.` };
                });

                const firstHighlight = mappedThemes[0]?.highlight;
                const secondHighlight = mappedThemes[1]?.highlight;

                const prologue = tripType === 'Corporate'
                    ? `We’ll open in Stockholm with private innovation salons, design penthouses, and strategy sessions reserved exclusively for ${group}.`
                    : `We’ll open in Stockholm with keys to design penthouses, curator-led gallery calls, and insider access tailored for ${group}.`;

                const interlude = firstHighlight
                    ? `Mid-journey, ${firstHighlight}`
                    : 'Mid-journey, we’ll chart a course north for snow-dusted seclusion and bespoke wellness rituals.';

                const finale = secondHighlight && secondHighlight !== firstHighlight
                    ? `We’ll conclude with ${secondHighlight} ensuring your finale feels both elevated and meaningful.`
                    : 'We’ll conclude across the Stockholm archipelago, pairing private vessels with Michelin-calibre celebrations beneath Nordic skies.';

                const durationPhrase = /night|day/i.test(duration) ? duration : `${duration} nights`;
                const seasonDescriptor = (() => {
                    const seasonLower = seasonRaw.toLowerCase();
                    if (!seasonRaw || seasonLower === 'your preferred season') {
                        return 'during your preferred season';
                    }
                    if (seasonLower.includes('season') || seasonLower.includes('spring') || seasonLower.includes('summer') || seasonLower.includes('autumn') || seasonLower.includes('winter') || seasonLower.includes('fall')) {
                        return `during ${seasonRaw}`;
                    }
                    if (seasonLower.includes('month') || seasonLower.includes('week')) {
                        return `across ${seasonRaw}`;
                    }
                    return `in ${seasonRaw}`;
                })();

                const paragraphOne = `I’m envisioning a ${durationPhrase} composition for ${group}, set ${seasonDescriptor}.`;
                const paragraphTwo = `${prologue} ${interlude}`;
                const paragraphThree = `${finale} With ${wishes}, every touchpoint stays cinematic yet effortless.`;

                const summary = [
                    `Trip Type: ${tripType === 'Corporate' ? 'Corporate & Incentives' : 'Private Journey (FIT)'}`,
                    `Themes: ${themes.join(', ')}`,
                    `Duration: ${duration}`,
                    `Group Size: ${group}`,
                    `Preferred Season: ${seasonRaw || 'Not specified'}`,
                    `Special Wishes: ${answers.wishes || 'Not specified'}`
                ].join('\n');

                return { paragraphs: [paragraphOne, paragraphTwo, paragraphThree], summary };
            }

            function handleConfirmation(input) {
                const normalized = input.toLowerCase();
                if (YES_RESPONSES.some(keyword => normalized.includes(keyword))) {
                    livConversation.awaitingConfirmation = false;
                    appendMessage('ai', 'Wonderful. I’ll share this draft with our human curators and prepare an introduction. Add your contact details below and we’ll respond within 24 hours.', { delay: 200 });
                    populateEnquiryFromConversation();
                    scrollToEnquiry();
                    return;
                }

                if (NO_RESPONSES.some(keyword => normalized.includes(keyword))) {
                    livConversation.awaitingConfirmation = false;
                    livConversation.expectingRefinement = true;
                    appendMessage('ai', 'Of course — tell me what you’d like me to adjust and I’ll refine the itinerary.', { delay: 200 });
                    return;
                }

                appendMessage('ai', 'I can pass this to our curators or fine-tune the draft. Just say the word.');
            }

            function populateEnquiryFromConversation() {
                if (enquiryTripType && livConversation.answers.tripType) {
                    enquiryTripType.value = livConversation.answers.tripType;
                }

                if (enquiryDates && !enquiryDates.value && livConversation.answers.duration) {
                    const dateValue = livConversation.answers.season
                        ? `${livConversation.answers.duration} · ${livConversation.answers.season}`
                        : livConversation.answers.duration;
                    enquiryDates.value = dateValue;
                }

                if (enquiryDetails) {
                    const combined = `${livConversation.summary}\n\nItinerary Draft:\n${livConversation.itineraryDraft}`.trim();
                    enquiryDetails.value = combined;
                }

                if (itineraryDraftField) {
                    itineraryDraftField.value = livConversation.itineraryDraft;
                }

                if (enquirySourceField) {
                    enquirySourceField.value = 'LIV Concierge';
                }

                if (enquiryStatus) {
                    enquiryStatus.textContent = 'Draft attached. Share your contact details and we’ll respond within 24 hours.';
                }
            }

            function scrollToEnquiry() {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                        if (enquiryName) {
                            enquiryName.focus();
                        }
                    }, 700);
                }
            }

            function handleFormSubmit(event) {
                event.preventDefault();
                if (!enquiryName || !enquiryEmail) return;

                const nameValid = enquiryName.value.trim();
                const emailValid = enquiryEmail.value.trim();

                if (!nameValid || !emailValid) {
                    if (enquiryStatus) {
                        enquiryStatus.textContent = 'Please add your name and email so our curators can reach you.';
                    }
                    return;
                }

                if (enquiryStatus) {
                    enquiryStatus.textContent = 'Tack! Our curators will respond within 24 hours.';
                }
            }

            function openChat() {
                chatOverlay.classList.add('show');
                startConversation();
                setTimeout(() => {
                    chatInput.focus();
                }, 400);
            }

            // Open chat overlay
            if (aiBtn) {
                aiBtn.addEventListener('click', openChat);
            }
            livTriggers.forEach(trigger => {
                trigger.addEventListener('click', (event) => {
                    event.preventDefault();

                    // Capture context from data attributes
                    const contextType = trigger.getAttribute('data-liv-context-type');
                    const contextName = trigger.getAttribute('data-liv-context-name');
                    const contextGreeting = trigger.getAttribute('data-liv-greeting');

                    if (contextType && contextName) {
                        livConversation.context = {
                            type: contextType,
                            name: contextName,
                            greeting: contextGreeting || generateGreeting(contextType, contextName)
                        };
                    }

                    openChat();
                });
            });

            // Generate personalized greeting based on context
            function generateGreeting(type, name) {
                const greetings = {
                    'destination': [
                        `Ah, ${name}! Magnificent choice. This is one of Sweden's most captivating destinations. Let me help you craft an unforgettable experience there.`,
                        `${name} — excellent taste. I'd be delighted to design a bespoke journey for you around this remarkable location.`,
                        `I see you're drawn to ${name}. Wonderful! Let's weave together the perfect itinerary for this extraordinary place.`
                    ],
                    'experience': [
                        `${name} — a superb choice. Let me help you design an experience that truly captures this essence.`,
                        `I love that you're interested in ${name}. This is one of my favorite themes to curate. Shall we begin crafting your journey?`,
                        `${name} speaks to those who seek depth and meaning. I'm excited to help you explore this dimension of Sweden.`
                    ],
                    'corporate': [
                        `${name} for your team — brilliant! Let me help design an experience that will inspire and transform your group.`,
                        `Corporate experiences in ${name} create lasting impact. I'd love to help you plan something truly memorable for your team.`
                    ]
                };

                const messages = greetings[type] || greetings['experience'];
                return messages[Math.floor(Math.random() * messages.length)];
            }

            enquiryTriggers.forEach(trigger => {
                trigger.addEventListener('click', (event) => {
                    event.preventDefault();
                    const type = trigger.getAttribute('data-open-enquiry');
                    if (enquiryTripType) {
                        enquiryTripType.value = type === 'corporate' ? 'Corporate' : 'FIT';
                    }
                    scrollToEnquiry();
                });
            });

            // Close chat overlay
            closeChat.addEventListener('click', function() {
                chatOverlay.classList.remove('show');
            });

            // Close on overlay click
            chatOverlay.addEventListener('click', function(e) {
                if (e.target === chatOverlay) {
                    chatOverlay.classList.remove('show');
                }
            });

            sendButton.addEventListener('click', handleTypedInput);

            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTypedInput();
                }
            });

            if (enquiryForm) {
                enquiryForm.addEventListener('submit', handleFormSubmit);
            }

            // Escape key to close chat
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && chatOverlay.classList.contains('show')) {
                    chatOverlay.classList.remove('show');
                }
            });

            // Interactive Map Functionality with Leaflet (Free OpenStreetMap)

            // Ensure Leaflet is loaded
            if (typeof L === 'undefined') {
                console.error('Leaflet is not loaded');
                return;
            }

            // Fallback destination data - will be overwritten by Supabase data when available
            let destinationData = {
                stockholm: {
                    title: 'Stockholm',
                    description: 'Sweden\'s capital blends royal heritage, innovative design, and vibrant cultural scenes. Explore after-hours palace access, Michelin dining, and Stockholm\'s creative underground.',
                    image: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Nature & Wellness', 'Design & Innovation', 'Royal, Art & Culture', 'Culinary', 'Nightlife & Celebrations'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [18.0686, 59.3293],
                    themeKeys: ['nature', 'design', 'royal-culture', 'culinary', 'nightlife'],
                    category: 'city'
                },
                gothenburg: {
                    title: 'Gothenburg',
                    description: 'Sweden\'s west coast gem combines maritime heritage with innovative cuisine. Explore seafood markets, contemporary art museums, and the charming Haga district.',
                    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Culinary', 'Royal, Art & Culture', 'Design & Innovation'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [11.9746, 57.7089],
                    themeKeys: ['culinary', 'royal-culture', 'design'],
                    category: 'city'
                },
                gotland: {
                    title: 'Gotland & Visby',
                    description: 'Medieval walls surround Visby on this Baltic island paradise. Discover ancient rune stones, limestone formations, and summer festivals in Sweden\'s sunniest region.',
                    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Royal, Art & Culture', 'Nature & Wellness'],
                    seasons: ['Spring', 'Summer', 'Autumn'],
                    coordinates: [18.2948, 57.6348],
                    themeKeys: ['royal-culture', 'nature'],
                    category: 'seaside'
                },
                dalarna: {
                    title: 'Dalarna',
                    description: 'The heart of Swedish folklore and tradition. Experience genuine Swedish culture, traditional crafts, Lake Siljan, and the iconic red Dala horses.',
                    image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Royal, Art & Culture', 'Legacy & Purpose', 'Nature & Wellness'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [14.5636, 60.6034],
                    themeKeys: ['royal-culture', 'legacy', 'nature'],
                    category: 'province'
                },
                lapland: {
                    title: 'Lapland',
                    description: 'Enter the Arctic wilderness for aurora vigils, glass-roof lodges, and transformative silence. Experience indigenous Sámi culture and winter\'s profound beauty.',
                    image: 'https://images.pexels.com/photos/2024881/pexels-photo-2024881.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Nature & Wellness', 'Legacy & Purpose'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [23.6850, 67.9222],
                    themeKeys: ['nature', 'legacy'],
                    category: 'province'
                },
                archipelago: {
                    title: 'Stockholm Archipelago',
                    description: 'Over 30,000 islands form Sweden\'s maritime playground. Private yacht journeys, foraging expeditions, and hidden island retreats await your discovery.',
                    image: 'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Nature & Wellness', 'Culinary'],
                    seasons: ['Spring', 'Summer', 'Autumn'],
                    coordinates: [18.5500, 59.4500],
                    themeKeys: ['nature', 'culinary'],
                    category: 'seaside'
                },
                malmo: {
                    title: 'Malmö',
                    description: 'Sweden\'s gateway to Europe combines Scandinavian cool with continental flair. Explore sustainable architecture, diverse culinary scenes, and proximity to Copenhagen.',
                    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Design & Innovation', 'Culinary', 'Royal, Art & Culture'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [13.0038, 55.6050],
                    themeKeys: ['design', 'culinary', 'royal-culture'],
                    category: 'city'
                },
                abisko: {
                    title: 'Abisko National Park',
                    description: 'Prime aurora viewing location in Swedish Lapland. Experience the Midnight Sun, pristine wilderness, and some of Europe\'s clearest skies for northern lights.',
                    image: 'https://images.pexels.com/photos/2024881/pexels-photo-2024881.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Nature & Wellness'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [18.8306, 68.3540],
                    themeKeys: ['nature'],
                    category: 'park'
                },
                vastergotland: {
                    title: 'Västergötland',
                    description: 'Ancient Viking heritage meets rolling countryside. Discover medieval churches, archaeological sites, and the birthplace of Swedish history.',
                    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Royal, Art & Culture', 'Legacy & Purpose'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [13.4, 58.3],
                    themeKeys: ['royal-culture', 'legacy'],
                    category: 'province'
                },
                uppsala: {
                    title: 'Uppsala',
                    description: 'Sweden\'s ancient university city combines academic excellence with Viking heritage. Explore Scandinavia\'s largest cathedral and historic botanical gardens.',
                    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Royal, Art & Culture', 'Legacy & Purpose'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [17.6389, 59.8586],
                    themeKeys: ['royal-culture', 'legacy'],
                    category: 'city'
                },
                skane: {
                    title: 'Skåne Region',
                    description: 'Southern Sweden\'s fertile plains offer castle trails, sandy beaches, and Europe\'s leading New Nordic cuisine scene.',
                    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Culinary', 'Royal, Art & Culture', 'Nature & Wellness'],
                    seasons: ['Spring', 'Summer', 'Autumn'],
                    coordinates: [13.5, 55.9],
                    themeKeys: ['culinary', 'royal-culture', 'nature'],
                    category: 'beach'
                },
                orebro: {
                    title: 'Örebro',
                    description: 'Lakeside charm with a fairytale castle. Experience innovative Swedish design, vibrant cultural scenes, and authentic local traditions.',
                    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Royal, Art & Culture', 'Design & Innovation'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [15.2134, 59.2753],
                    themeKeys: ['royal-culture', 'design'],
                    category: 'city'
                },
                jamtland: {
                    title: 'Jämtland',
                    description: 'Mountain wilderness perfect for outdoor adventures. Discover ski resorts, hiking trails, and authentic Sami cultural experiences.',
                    image: 'https://images.pexels.com/photos/2024881/pexels-photo-2024881.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Nature & Wellness', 'Legacy & Purpose'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [14.6, 63.2],
                    themeKeys: ['nature', 'legacy'],
                    category: 'ski'
                },
                storyteller_astrid: {
                    title: 'Astrid\'s Sweden',
                    description: 'Follow the literary journey of Astrid Lindgren. Explore Vimmerby, storytelling experiences, and the landscapes that inspired Pippi Longstocking.',
                    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Royal, Art & Culture', 'Legacy & Purpose'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [15.8551, 57.6681],
                    themeKeys: ['royal-culture', 'legacy'],
                    category: 'storyteller'
                },
                storyteller_bergman: {
                    title: 'Bergman\'s Fårö',
                    description: 'Discover Ingmar Bergman\'s island retreat. Explore film locations, the director\'s home, and the stark landscapes that shaped cinematic masterpieces.',
                    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Royal, Art & Culture', 'Nature & Wellness'],
                    seasons: ['Spring', 'Summer', 'Autumn'],
                    coordinates: [19.1, 57.95],
                    themeKeys: ['royal-culture', 'nature'],
                    category: 'storyteller'
                },
                storyteller_abba: {
                    title: 'ABBA Experience',
                    description: 'Immerse yourself in ABBA\'s musical legacy. Visit the interactive museum, recording studios, and Stockholm venues where the legends performed.',
                    image: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Royal, Art & Culture', 'Nightlife & Celebrations'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [18.09, 59.32],
                    themeKeys: ['royal-culture', 'nightlife'],
                    category: 'storyteller'
                },
                storyteller_nobel: {
                    title: 'Nobel Legacy',
                    description: 'Trace Alfred Nobel\'s footsteps through Stockholm. Experience the Nobel Prize Museum, annual ceremony venues, and the inventor\'s innovative spirit.',
                    image: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
                    themes: ['Legacy & Purpose', 'Design & Innovation', 'Royal, Art & Culture'],
                    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
                    coordinates: [18.07, 59.325],
                    themeKeys: ['legacy', 'design', 'royal-culture'],
                    category: 'storyteller'
                }
            };

            const destinationCardsGrid = document.getElementById('destinationCardsGrid');
            const seasonBtns = document.querySelectorAll('.season-btn');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const categoryFilterBtns = document.querySelectorAll('.category-filter-btn');

            let currentSeason = 'spring';
            let currentFilter = 'all';
            let activeCategories = new Set(['province', 'city', 'seaside', 'beach', 'ski', 'park', 'storyteller']); // All active by default
            let selectedCities = new Set();
            let markers = {};
            let map;

            // Initialize Leaflet Map with OpenStreetMap (Free!) - Only if map container exists
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                console.log('Waiting for Supabase data to load...');

                // Function to initialize the map
                function initializeMap() {
                    console.log('Initializing Leaflet map...');

            try {
                // Hide loading indicator
                const loadingIndicator = document.getElementById('mapLoadingIndicator');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }

                // Check if map is already initialized and remove it
                if (mapContainer._leaflet_id) {
                    console.log('Map already initialized, removing old instance');
                    mapContainer._leaflet_id = undefined;
                }

                // Detect if mobile/touch device
                const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);

                map = L.map('map', {
                    center: [62, 15],
                    zoom: 5,
                    zoomControl: true,
                    scrollWheelZoom: false, // Disabled by default to prevent scroll hijacking
                    dragging: !isMobile, // Disable dragging on mobile initially
                    tap: isMobile,
                    touchZoom: isMobile
                });

                // Enable scroll wheel zoom only after user clicks/taps on the map
                map.once('click focus', function() {
                    map.scrollWheelZoom.enable();
                    map.dragging.enable();
                });

                // Show message to users on mobile
                if (isMobile) {
                    map.on('click', function() {
                        map.scrollWheelZoom.enable();
                        map.dragging.enable();
                    });
                }

                console.log('Map initialized successfully');

                // Store map instance for theme toggle
                window.mapInstance = map;

                // Add tile layer based on current theme
                const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
                const tileUrl = currentTheme === 'light'
                    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

                currentTileLayer = L.tileLayer(tileUrl, {
                    attribution: '© OpenStreetMap contributors © CARTO',
                    subdomains: 'abcd',
                    maxZoom: 19
                }).addTo(map);

                console.log('Tile layer added');

                // Force map to resize (fixes blank map issue)
                setTimeout(() => {
                    map.invalidateSize();
                    console.log('Map size invalidated');
                }, 100);

            } catch (error) {
                console.error('Error initializing map:', error);
                // If map initialization fails, skip all map-related code
                map = null;
            }

            // Only continue with map-related code if map was successfully initialized
            if (map) {
            // Map overlay card elements
            const mapOverlayCard = document.getElementById('mapOverlayCard');
            const mapCardClose = document.getElementById('mapCardClose');
            const mapCardImage = document.getElementById('mapCardImage');
            const mapCardTitle = document.getElementById('mapCardTitle');
            const mapCardDescription = document.getElementById('mapCardDescription');
            const mapCardThemes = document.getElementById('mapCardThemes');
            const mapCardSeasons = document.getElementById('mapCardSeasons');

            // Show map overlay card
            function showMapOverlayCard(cityKey, data) {
                if (!mapOverlayCard || !data) return;

                // Populate card content
                mapCardImage.src = data.image;
                mapCardImage.alt = data.title;
                mapCardTitle.textContent = data.title;
                mapCardDescription.textContent = data.description;

                // Populate themes
                mapCardThemes.innerHTML = data.themes
                    .map(theme => `<span class="map-card-theme-tag">${theme}</span>`)
                    .join('');

                // Populate seasons
                mapCardSeasons.innerHTML = data.seasons
                    .map(season => `<span class="map-card-season-tag">${season}</span>`)
                    .join('');

                // Update the map card CTA button with context attributes
                const mapCardCta = mapOverlayCard.querySelector('.map-card-cta');
                if (mapCardCta) {
                    mapCardCta.setAttribute('data-liv-context-type', 'destination');
                    mapCardCta.setAttribute('data-liv-context-name', data.title);
                }

                // Show card
                mapOverlayCard.style.display = 'block';
            }

            // Hide map overlay card
            function hideMapOverlayCard() {
                if (mapOverlayCard) {
                    mapOverlayCard.style.display = 'none';
                }
            }

            // Close button handler
            if (mapCardClose) {
                mapCardClose.addEventListener('click', hideMapOverlayCard);
            }

            // Create destination card
            function createDestinationCard(cityKey) {
                const data = destinationData[cityKey];
                if (!data) return null;

                const card = document.createElement('article');
                card.className = 'destination-card';
                card.dataset.city = cityKey;

                card.innerHTML = `
                    <div class="destination-media">
                        <img src="${data.image}" alt="${data.title}" loading="lazy">
                    </div>
                    <div class="destination-body">
                        <h3>${data.title}</h3>
                        <p>${data.description}</p>
                        <div class="destination-tags">
                            ${data.themes.map(theme => `<span class="destination-tag">${theme}</span>`).join('')}
                            ${data.seasons.map(season => `<span class="destination-tag destination-season-tag">${season}</span>`).join('')}
                        </div>
                        <button type="button" class="destination-cta" data-open-liv data-liv-context-type="destination" data-liv-context-name="${data.title}">Design Journey with LIV</button>
                    </div>
                `;

                return card;
            }

            // Update cards display
            function updateCardsDisplay() {
                destinationCardsGrid.innerHTML = '';

                if (selectedCities.size === 0) {
                    destinationCardsGrid.classList.remove('show');
                    return;
                }

                selectedCities.forEach(cityKey => {
                    const card = createDestinationCard(cityKey);
                    if (card) {
                        destinationCardsGrid.appendChild(card);
                    }
                });

                destinationCardsGrid.classList.add('show');

                setTimeout(() => {
                    destinationCardsGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }

            // Filter markers
            function filterMarkers() {
                Object.keys(destinationData).forEach(cityKey => {
                    const data = destinationData[cityKey];
                    const marker = markers[cityKey];

                    if (!marker) return;

                    const seasonMatch = data.seasons.map(s => s.toLowerCase()).includes(currentSeason);
                    const themeMatch = currentFilter === 'all' || data.themeKeys.includes(currentFilter);
                    const categoryMatch = activeCategories.has(data.category);

                    const markerEl = marker.getElement();
                    if (seasonMatch && themeMatch && categoryMatch) {
                        markerEl.classList.remove('marker-hidden');
                    } else {
                        markerEl.classList.add('marker-hidden');
                    }
                });
            }

            // Add markers to map
            Object.keys(destinationData).forEach(cityKey => {
                const data = destinationData[cityKey];

                // Create custom marker element
                const el = document.createElement('div');
                el.className = 'custom-marker';
                el.dataset.city = cityKey;
                el.dataset.category = data.category;

                // Add click event
                el.addEventListener('click', function() {
                    if (selectedCities.has(cityKey)) {
                        selectedCities.delete(cityKey);
                    } else {
                        selectedCities.add(cityKey);
                    }
                    updateCardsDisplay();
                });

                // Create Leaflet marker with custom icon
                const icon = L.divIcon({
                    html: el.outerHTML,
                    className: '',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                const marker = L.marker([data.coordinates[1], data.coordinates[0]], { icon: icon })
                    .addTo(map);

                // Store reference to the actual DOM element
                marker.getElement = function() {
                    return marker._icon.querySelector('.custom-marker');
                };

                // Re-attach click handler to the rendered element
                setTimeout(() => {
                    const renderedEl = marker.getElement();
                    if (renderedEl) {
                        renderedEl.addEventListener('click', function() {
                            showMapOverlayCard(cityKey, data);
                        });
                    }
                }, 100);

                markers[cityKey] = marker;
            });

            // Initial filter
            setTimeout(() => filterMarkers(), 200);

            // Season toggle
            seasonBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    seasonBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentSeason = this.dataset.season;
                    filterMarkers();
                });
            });

            // Theme filters
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.dataset.filter;
                    filterMarkers();
                });
            });

            // Category filters
            categoryFilterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const category = this.dataset.category;

                    // Toggle category
                    if (activeCategories.has(category)) {
                        activeCategories.delete(category);
                        this.classList.remove('active');
                    } else {
                        activeCategories.add(category);
                        this.classList.add('active');
                    }

                    filterMarkers();
                });
            });
            } // End of if (map) check - map successfully initialized
            } // End of initializeMap function

            // Listen for Supabase data loaded event
            window.addEventListener('supabaseDataLoaded', (event) => {
                console.log('Supabase data loaded event received');
                const { destinations, themes } = event.detail;
                console.log(`Loaded ${destinations.length} destinations and ${themes.length} themes from Supabase`);

                // Update local reference to point to the global data
                destinationData = window.destinationData || destinationData;

                console.log('Using destinationData with', Object.keys(destinationData).length, 'destinations');

                // Data is already populated in window.destinationData and window.LIV_THEME_LIBRARY
                // by supabase-client.js, so we just need to initialize the map
                initializeMap();
            });

            // Error handling if Supabase fails
            window.addEventListener('supabaseDataError', (event) => {
                console.error('Failed to load data from Supabase:', event.detail?.error);
                const loadingIndicator = document.getElementById('mapLoadingIndicator');
                if (loadingIndicator) {
                    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Unable to load destinations. Please refresh the page.</p>';
                }
            });

            } // End of map container check

            // Pillar Modal Functionality
            const pillarModal = document.getElementById('pillarModal');
            const modalTitle = document.getElementById('modal-title');
            const modalImage = document.getElementById('modal-image');
            const modalDescription = document.getElementById('modal-description');
            const modalCta = document.getElementById('modal-cta');
            const modalClose = document.querySelector('.pillar-modal-close');
            const modalOverlay = document.querySelector('.pillar-modal-overlay');

            // Modal data for each pillar
            const pillarData = {
                nature: {
                    title: "Nature & Wellness in Sweden",
                    image: "https://images.pexels.com/photos/2024881/pexels-photo-2024881.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    contextType: "experience",
                    contextName: "Nature & Wellness",
                    content: `
                        <p><strong>Rewild your senses. Restore your balance. Rediscover yourself.</strong></p>
                        <p>Experience the art of slowing down in Sweden's pure, healing landscapes. Stay in mirrored forest cabins, glass igloos beneath the Northern Lights, or secluded seaside villas across the archipelago. Wake to birdsong, swim in crystal-clear lakes, and let the stillness of nature guide you back to balance.</p>
                        <p>Here, ancient Nordic rituals meet cutting-edge wellness innovation. Whether you seek deep rest, reconnection, or transformation, Sweden offers experiences that harmonize body, mind, and spirit—rooted in the elements and inspired by simplicity.</p>

                        <h3>Nature Experiences</h3>
                        <p>Immerse yourself in pristine landscapes designed to restore and inspire:</p>
                        <ul>
                            <li>Forest Bathing in Tyresta National Park or Dalarna's pine forests</li>
                            <li>Hiking the King's Trail (Kungsleden) in Swedish Lapland</li>
                            <li>Canoeing & Wild Camping among Värmland's serene lakes</li>
                            <li>Dog Sledding & Aurora Safaris in Abisko National Park</li>
                            <li>Foraging for Wild Berries & Mushrooms in Småland</li>
                            <li>Ice Swimming & Sauna Rituals on frozen lake shores</li>
                            <li>Archipelago Kayaking through Stockholm's 30,000 islands</li>
                        </ul>

                        <h3>Spa & Wellness Experiences</h3>
                        <p>Soothe your senses and embrace Sweden's natural approach to wellbeing:</p>
                        <ul>
                            <li>Sauna & Cold Plunge Rituals at Arctic Bath, Harads</li>
                            <li>Floating Spa & Japanese-Inspired Treatments at Yasuragi, Stockholm</li>
                            <li>Seaweed & Salt Scrub Therapies at Varberg Kusthotell</li>
                            <li>Forest Meditation & Sound Healing at Stedsans in the Woods, Halland</li>
                            <li>Yoga & Mindfulness Retreats at Shambala Gatherings, Dalarna</li>
                            <li>Cryotherapy & Biohacking Workshops in Stockholm</li>
                            <li>Thermal Bathing & Spa Journeys at Raison d'Être Spa, Grand Hôtel Stockholm</li>
                        </ul>

                        <h3>Transformative Wellness Journeys</h3>
                        <p>For those seeking more than rest, Sweden's wellness innovators and longevity experts design holistic programs that merge nature, neuroscience, and nutrition—helping you recharge, rebalance, and reconnect in one of the world's most peaceful settings.</p>
                    `,
                    cta: "Design My Journey with LIV"
                },
                design: {
                    title: "Design & Innovation",
                    image: "https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    contextType: "experience",
                    contextName: "Design & Innovation",
                    content: `
                        <p>Stockholm is one of the world's unicorn capitals — a cradle of startups and cutting-edge design. We open doors to private design studios, fashion ateliers, and sustainable innovation labs. Meet the entrepreneurs behind global icons and enjoy one-on-one encounters with Sweden's creatives and thinkers.</p>
                    `,
                    cta: "Design My Journey with LIV"
                },
                "royal-culture": {
                    title: "Royal, Art & Culture",
                    image: "https://images.pexels.com/photos/18499031/pexels-photo-18499031.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    contextType: "experience",
                    contextName: "Royal, Art & Culture",
                    content: `
                        <p>Discover Sweden's refined blend of heritage and creativity. Explore private castles and royal palaces after hours, then step into the world of contemporary art, design studios, and collector salons. A journey where history, culture, and innovation meet in timeless Scandinavian style.</p>
                    `,
                    cta: "Design My Journey with LIV"
                },
                culinary: {
                    title: "Culinary Experiences",
                    image: "https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    contextType: "experience",
                    contextName: "Culinary Experiences",
                    content: `
                        <p>Discover Sweden through its flavors. Join Michelin-trained chefs in hands-on cooking sessions inspired by the seasons. Forage for wild herbs and mushrooms with local experts, then dine in forest kitchens where nature sets the table. Enjoy gourmet food tours, private tasting visits, and warm home dinners that open the door to authentic Swedish life. Hear Sami stories and share traditional dishes around the fire — each meal a chapter of Sweden's land, culture, and culinary heritage.</p>
                    `,
                    cta: "Design My Journey with LIV"
                },
                nightlife: {
                    title: "Nightlife & Celebration",
                    image: "https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    contextType: "experience",
                    contextName: "Nightlife & Celebration",
                    content: `
                        <p>Swedes know how to party — and we bring you inside their most exclusive scenes. Sip champagne in members-only clubs, dance under the midnight sun at a private island midsummer gala, or host your own soirée in a designer's loft. For the bold, rent out a mansion and let us curate an unforgettable night with live acts, local creatives, and a guest list to remember.</p>
                    `,
                    cta: "Design My Journey with LIV"
                },
                legacy: {
                    title: "Legacy & Meaningful Travel",
                    image: "https://images.pexels.com/photos/2879991/pexels-photo-2879991.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    contextType: "experience",
                    contextName: "Legacy & Meaningful Travel",
                    content: `
                        <p>Travel with purpose and perspective. Support Sami heritage projects, experience rewilding initiatives, or participate in sustainable design collaborations. Every journey leaves a positive footprint — giving back to the land, the culture, and the communities that make Sweden unique.</p>
                    `,
                    cta: "Design My Journey with LIV"
                },
                innovation: {
                    title: "Innovation & Creativity",
                    image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    content: `
                        <p><strong>Where bold ideas meet Nordic design and future thinking.</strong></p>
                        <p>Step into Sweden's innovation playground — a nation of unicorns, sustainability pioneers, and design visionaries. Here, creativity thrives in co-working lofts, waterfront tech hubs, and repurposed industrial spaces turned into idea labs.</p>
                        <p>Bring your team into this dynamic environment where business meets inspiration. Meet startup founders and green-tech trailblazers, join hands-on workshops in innovation and leadership, and explore how Swedish culture turns collaboration into creation. Each experience is designed to spark ideas, strengthen team connection, and ignite forward-thinking energy that lasts long after the trip ends.</p>

                        <h3>Innovation Safaris</h3>
                        <p>Discover the ideas shaping the future. Guided tours and encounters that reveal Sweden's creative ecosystem.</p>
                        <ul>
                            <li>Startup & Scaleup Tours — Visit leading tech hubs and incubators in Stockholm and Gothenburg</li>
                            <li>Green-Tech Encounters — Explore labs pioneering clean energy, recycling tech, and circular economy solutions</li>
                            <li>Founder Meetups — Learn directly from entrepreneurs and changemakers</li>
                            <li>Innovation Labs — Join hands-on sessions in AI, biotech, and smart mobility</li>
                            <li>Trend Scouting Expeditions — Spot emerging ideas in design, lifestyle, and sustainability</li>
                        </ul>

                        <h3>Creative Incentives</h3>
                        <p>Boost creativity and team spirit through inspiring, interactive experiences.</p>
                        <ul>
                            <li>Archipelago Sailing Races — Collaborative team challenges on the Baltic Sea</li>
                            <li>Nordic Gastronomy Contests — Cook with top chefs using local, sustainable ingredients</li>
                            <li>Entrepreneurial Workshops — Build innovation leadership and agile mindsets</li>
                            <li>Cool Hunting & Design Walks — Explore Stockholm's trendsetting districts, concept stores, and studios</li>
                            <li>Design Sprints & Creative Hackathons — Co-create ideas guided by Swedish designers</li>
                            <li>Music & Innovation Experiences — Learn from world-leading producers and creative entrepreneurs</li>
                        </ul>

                        <h3>Transformative Learning Journeys</h3>
                        <p>For teams seeking meaningful growth, Sweden offers immersive programs that blend innovation with wellbeing. Tailored learning journeys combine startup insights, creative collaboration, and leadership development — turning inspiration into actionable strategy.</p>
                    `,
                    cta: "Plan with LIV"
                },
                leadership: {
                    title: "Leadership Retreats",
                    image: "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    content: `
                        <p>Swap the boardroom for a castle, a mirrored forest lodge, or a private island villa. Executive retreats combine strategic focus with Swedish wellness: sauna rituals, guided silence, and outdoor adventure.</p>
                    `,
                    cta: "Plan Your Retreat"
                },
                celebration: {
                    title: "Celebration & Recognition",
                    image: "https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    content: `
                        <p>Business milestones deserve more than a ballroom. Celebrate with a Scandi White Party on a private island, a royal gala in a candlelit palace, or an Innovation Party Night with startup founders and Michelin catering.</p>
                    `,
                    cta: "Design Your Event"
                },
                purpose: {
                    title: "Culture & Purpose",
                    image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    content: `
                        <p>Sweden's cultural and social legacy inspires transformation. Backstage access to Stockholm Fashion Week, private design fairs, or CSR narratives supporting Sami communities and eco-startups.</p>
                    `,
                    cta: "Create Impact"
                },
                wellness: {
                    title: "Wellness & Biohacking",
                    image: "https://images.pexels.com/photos/3771097/pexels-photo-3771097.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    content: `
                        <p>Executive performance meets longevity. Transform your leadership team through cutting-edge wellness protocols, Nordic cold therapy, and personalized biohacking experiences in pristine Swedish nature.</p>
                    `,
                    cta: "Optimize Performance"
                },
                incentive: {
                    title: "Creative Incentives",
                    image: "https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1",
                    content: `
                        <p>Reward your team with unforgettable experiences. Sailing races through the archipelago, gastronomy contests with Michelin chefs, design sprints in iconic studios, or adventure challenges in Lapland.</p>
                    `,
                    cta: "Reward Excellence"
                }
            };

            // Open modal when read-more button is clicked
            document.querySelectorAll('.read-more-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const card = this.closest('.pillar-card');
                    const pillarType = card.dataset.pillar;
                    const data = pillarData[pillarType];

                    if (data) {
                        modalTitle.textContent = data.title;
                        modalImage.src = data.image;
                        modalImage.alt = data.title;
                        modalDescription.innerHTML = data.content;
                        modalCta.textContent = data.cta;

                        // Set context attributes for LIV personalization
                        if (data.contextType && data.contextName) {
                            modalCta.setAttribute('data-liv-context-type', data.contextType);
                            modalCta.setAttribute('data-liv-context-name', data.contextName);
                        }

                        pillarModal.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    }
                });
            });

            // Close modal
            function closePillarModal() {
                pillarModal.style.display = 'none';
                document.body.style.overflow = '';
            }

            modalClose?.addEventListener('click', closePillarModal);
            modalOverlay?.addEventListener('click', closePillarModal);

            // Close on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && pillarModal.style.display === 'flex') {
                    closePillarModal();
                }
            });

            // Footer background slideshow
            const footerBackgroundImages = [
                'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1920', // Northern Lights
                'https://images.pexels.com/photos/1670732/pexels-photo-1670732.jpeg?auto=compress&cs=tinysrgb&w=1920', // Stockholm waterfront
                'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1920', // Swedish archipelago
                'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1920', // Lapland winter
                'https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=1920', // Swedish forest
                'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=1920'  // Mountain landscape
            ];

            function initFooterSlideshow() {
                const footerBg = document.getElementById('footerBackground');
                if (!footerBg) return;

                let currentImageIndex = 0;

                // Create image elements
                footerBackgroundImages.forEach((imageUrl, index) => {
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'footer-bg-image';
                    imageDiv.style.backgroundImage = `url('${imageUrl}')`;
                    if (index === 0) {
                        imageDiv.classList.add('active');
                    }
                    footerBg.appendChild(imageDiv);
                });

                const imageElements = footerBg.querySelectorAll('.footer-bg-image');

                // Cycle through images
                function cycleImages() {
                    const currentImage = imageElements[currentImageIndex];
                    const nextImageIndex = (currentImageIndex + 1) % footerBackgroundImages.length;
                    const nextImage = imageElements[nextImageIndex];

                    // Fade out current, fade in next
                    currentImage.classList.remove('active');
                    nextImage.classList.add('active');

                    currentImageIndex = nextImageIndex;
                }

                // Change image every 6 seconds
                setInterval(cycleImages, 6000);
            }

            // Initialize footer slideshow
            initFooterSlideshow();

            // Hero video is now handled directly via HTML video element
            // No slideshow initialization needed
        });
