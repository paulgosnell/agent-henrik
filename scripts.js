// Call lucide.createIcons() immediately since scripts are at bottom of HTML
if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', function() {

            // Theme Toggle Functionality
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

            // Initialize theme toggle - wait for footer component to load
            function initThemeToggle() {
                const themeToggle = document.getElementById('themeToggle');
                if (themeToggle) {
                    themeToggle.addEventListener('click', () => {
                        const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
                        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                        setTheme(newTheme);
                    });
                    console.log('✅ Theme toggle initialized');
                }
            }

            // Listen for footer component to load, then initialize theme toggle
            document.addEventListener('component-loaded:footer', initThemeToggle);

            // Also try to initialize immediately in case footer is already loaded
            initThemeToggle();

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    setTheme(e.matches ? 'light' : 'dark');
                }
            });

            // Load Press Panels from Database
            async function loadPressPanels() {
                const container = document.getElementById('pressPanelsContainer');
                if (!container) return;

                try {
                    const { data: pressItems, error } = await window.Supabase.client
                        .from('press_items')
                        .select('*')
                        .not('published_at', 'is', null)
                        .order('display_order', { ascending: true });

                    if (error) throw error;

                    if (!pressItems || pressItems.length === 0) {
                        container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">No press coverage available at this time.</p>';
                        return;
                    }

                    container.innerHTML = pressItems.map(item => {
                        const target = item.link_type === 'pdf' ? '_blank' : '_blank';
                        const rel = 'noopener noreferrer';

                        return `
                            <a href="${item.link_url}" target="${target}" rel="${rel}" class="press-panel">
                                <div class="press-panel-image">
                                    <img src="${item.image_url}" alt="${item.title}">
                                </div>
                                <div class="press-panel-content">
                                    <h3 class="press-panel-title">${item.title}</h3>
                                    ${item.description ? `<p class="press-panel-description">${item.description}</p>` : ''}
                                </div>
                            </a>
                        `;
                    }).join('');

                } catch (error) {
                    console.error('Error loading press panels:', error);
                    container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">Unable to load press coverage.</p>';
                }
            }

            // Load press panels on page load
            loadPressPanels();

            // Declare aiBtn at top level so it's accessible to both nav and LIV code
            const aiBtn = document.getElementById('aiConciergeBtn');

            // Initialize navigation scroll behavior
            function initializeNavScrollBehavior() {
                const hero = document.querySelector('.hero');
                const heroContent = document.getElementById('heroContent');
                const heroCompass = document.querySelector('.hero-scroll-compass');
                const navHeader = document.querySelector('.nav-header');
                const heroMediaVideos = document.querySelectorAll('.hero-video');
                const primaryHeroVideo = document.getElementById('heroPrimaryVideo');
                const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

                // If nav header not found, retry after a delay
                if (!navHeader) {
                    console.warn('Nav header not found, retrying...');
                    setTimeout(initializeNavScrollBehavior, 100);
                    return;
                }

                console.log('✅ Nav header found, initializing scroll behavior');

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
            } // End of initializeNavScrollBehavior

            // Call nav scroll behavior initialization
            // This will retry if nav header not loaded yet
            initializeNavScrollBehavior();

            // NOTE: Menu initialization moved to menu-init.js
            // This prevents conflicts with component loading timing

            // AI Concierge functionality
            const chatOverlay = document.getElementById('chatOverlay');
            const closeChat = document.getElementById('closeChat');
            const chatInput = document.getElementById('chatInput');
            const sendButton = document.getElementById('sendButton');
            const chatMessages = document.getElementById('chatMessages');
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

            function resetConversation() {
                // Reset all conversation state
                livConversation.started = false;
                livConversation.stepIndex = 0;
                livConversation.awaitingConfirmation = false;
                livConversation.expectingRefinement = false;
                livConversation.answers = {};
                livConversation.itineraryDraft = '';
                livConversation.summary = '';
                livConversation.context = null;

                // Clear all chat messages
                if (chatMessages) {
                    chatMessages.innerHTML = '';
                }
            }

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

            async function handleFormSubmit(event) {
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

                // Show loading state
                if (enquiryStatus) {
                    enquiryStatus.textContent = 'Submitting...';
                }

                try {
                    // Get form data
                    const phone = document.getElementById('enquiryPhone')?.value.trim();
                    const tripType = enquiryTripType?.value;
                    const people = document.getElementById('enquiryPeople')?.value.trim();
                    const budget = document.getElementById('enquiryBudget')?.value.trim();
                    const dates = enquiryDates?.value.trim();
                    const details = enquiryDetails?.value.trim();
                    const source = enquirySourceField?.value || 'contact_form';

                    // Upsert lead (insert or update if email exists)
                    const { data: lead, error: leadError } = await window.Supabase.client
                        .from('leads')
                        .upsert({
                            email: emailValid,
                            name: nameValid,
                            phone: phone || null,
                            source: source,
                            status: 'new'
                        }, {
                            onConflict: 'email',
                            ignoreDuplicates: false
                        })
                        .select()
                        .single();

                    if (leadError) throw leadError;

                    // Create booking inquiry
                    const { error: inquiryError } = await window.Supabase.client
                        .from('booking_inquiries')
                        .insert({
                            lead_id: lead?.id || null,
                            email: emailValid,
                            name: nameValid,
                            phone: phone || null,
                            special_requests: `${tripType ? 'Trip Type: ' + tripType + '\n' : ''}${people ? 'Number of people: ' + people + '\n' : ''}${budget ? 'Budget: ' + budget + '\n' : ''}${dates ? 'Dates: ' + dates + '\n' : ''}${details || ''}`.trim(),
                            itinerary_summary: itineraryDraftField?.value || null,
                            status: 'pending'
                        });

                    if (inquiryError) throw inquiryError;

                    // Show success message
                    if (enquiryStatus) {
                        enquiryStatus.textContent = 'Tack! Our curators will respond within 24 hours.';
                        enquiryStatus.style.color = 'var(--color-accent-forest, green)';
                    }

                    // Reset form
                    enquiryForm.reset();
                    if (itineraryDraftField) itineraryDraftField.value = '';

                } catch (error) {
                    console.error('Error submitting form:', error);
                    if (enquiryStatus) {
                        enquiryStatus.textContent = 'Sorry, there was an error. Please try again or email us directly.';
                        enquiryStatus.style.color = 'red';
                    }
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
                aiBtn.addEventListener('click', () => {
                    // Use new LivAI class if available
                    if (window.LivAI) {
                        window.LivAI.openChat();
                    } else {
                        // Fallback to old implementation
                        openChat();
                    }
                });
            }
            // Use event delegation to handle both static and dynamically generated buttons
            document.addEventListener('click', (event) => {
                // Check if clicked element or any parent has [data-open-liv]
                const trigger = event.target.closest('[data-open-liv]');
                if (!trigger) return;

                event.preventDefault();

                // Capture context from data attributes
                const contextType = trigger.getAttribute('data-liv-context-type');
                const contextName = trigger.getAttribute('data-liv-context-name');
                const contextGreeting = trigger.getAttribute('data-liv-greeting');

                // Use new LivAI class
                if (window.LivAI && contextType && contextName) {
                    const context = {
                        type: contextType,
                        name: contextName,
                        greeting: contextGreeting
                    };
                    window.LivAI.openChatWithContext(context);
                } else if (window.LivAI) {
                    // Open without context for general AI button
                    window.LivAI.openChat();
                } else {
                    // Fallback to old implementation if LivAI not loaded
                    resetConversation();
                    if (contextType && contextName) {
                        livConversation.context = {
                            type: contextType,
                            name: contextName,
                            greeting: contextGreeting || generateGreeting(contextType, contextName)
                        };
                    }
                    openChat();
                }
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
            if (closeChat) {
                closeChat.addEventListener('click', function() {
                    chatOverlay.classList.remove('show');
                });
            }

            // Close on overlay click
            if (chatOverlay) {
                chatOverlay.addEventListener('click', function(e) {
                    if (e.target === chatOverlay) {
                        chatOverlay.classList.remove('show');
                    }
                });
            }

            if (sendButton) {
                sendButton.addEventListener('click', handleTypedInput);
            }

            if (chatInput) {
                chatInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTypedInput();
                    }
                });
            }

            if (enquiryForm) {
                enquiryForm.addEventListener('submit', handleFormSubmit);
            }

            // Newsletter form handler
            const newsletterForm = document.getElementById('newsletterForm');
            const newsletterEmail = document.getElementById('newsletterEmail');
            const newsletterStatus = document.getElementById('newsletterStatus');

            if (newsletterForm) {
                newsletterForm.addEventListener('submit', async (event) => {
                    event.preventDefault();

                    const email = newsletterEmail?.value.trim();
                    if (!email) return;

                    // Show loading state
                    if (newsletterStatus) {
                        newsletterStatus.textContent = 'Subscribing...';
                        newsletterStatus.style.color = '';
                    }

                    try {
                        // Upsert lead (insert or update if email exists)
                        const { error } = await window.Supabase.client
                            .from('leads')
                            .upsert({
                                email: email,
                                source: 'newsletter',
                                status: 'new'
                            }, {
                                onConflict: 'email',
                                ignoreDuplicates: false
                            });

                        if (error) throw error;

                        // Show success message
                        if (newsletterStatus) {
                            newsletterStatus.textContent = 'Thank you for subscribing!';
                            newsletterStatus.style.color = 'var(--color-accent-forest, green)';
                        }

                        // Reset form
                        newsletterForm.reset();

                    } catch (error) {
                        console.error('Error subscribing to newsletter:', error);
                        if (newsletterStatus) {
                            newsletterStatus.textContent = 'Sorry, there was an error. Please try again.';
                            newsletterStatus.style.color = 'red';
                        }
                    }
                });
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
                }
                // NOTE: Storyteller markers are now loaded dynamically from the stories table
                // via supabase-client.js. No need for hardcoded fallback storytellers.
            };

            const destinationCardsGrid = document.getElementById('destinationCardsGrid');
            const seasonBtns = document.querySelectorAll('.season-btn');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const categoryFilterBtns = document.querySelectorAll('.category-filter-btn');
            const categoryToggleAll = document.getElementById('categoryToggleAll');

            let currentSeason = 'spring';
            let activeThemes = new Set(['nature', 'design', 'royal-culture', 'culinary', 'nightlife', 'legacy']); // All active by default
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

                    // Store full context for LIV AI
                    mapCardCta.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent [data-open-liv] handler from also firing
                        // Dispatch event with full destination context
                        document.dispatchEvent(new CustomEvent('mapMarkerClicked', {
                            detail: {
                                destination: {
                                    title: data.title,
                                    category: data.category,
                                    themes: data.themes,
                                    seasons: data.seasons,
                                    description: data.description
                                }
                            }
                        }));
                    };
                }

                // Show card
                mapOverlayCard.style.display = 'block';

                // Hide header on mobile
                const navHeader = document.querySelector('.nav-header');
                if (navHeader && window.innerWidth <= 768) {
                    navHeader.style.display = 'none';
                }
            }

            // Hide map overlay card
            function hideMapOverlayCard() {
                if (mapOverlayCard) {
                    mapOverlayCard.style.display = 'none';
                }

                // Show header again
                const navHeader = document.querySelector('.nav-header');
                if (navHeader) {
                    navHeader.style.display = '';
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

                // NOTE: No need to attach event listeners here - the global [data-open-liv] handler
                // in the main DOMContentLoaded listener already handles all LIV buttons

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
                    // Check if any active theme matches any of the destination's themes
                    const themeMatch = activeThemes.size === 0 ? false : data.themeKeys.some(theme => activeThemes.has(theme));
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
            const themeToggleAll = document.getElementById('themeToggleAll');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const filter = this.dataset.filter;

                    // Handle 'All' toggle button
                    if (filter === 'all') {
                        const isActive = this.classList.contains('active');
                        if (isActive) {
                            // Turn all off
                            activeThemes.clear();
                            filterBtns.forEach(b => {
                                if (b.dataset.filter !== 'all') {
                                    b.classList.remove('active');
                                }
                            });
                            this.classList.remove('active');
                            this.textContent = 'All Off';
                        } else {
                            // Turn all on
                            activeThemes = new Set(['nature', 'design', 'royal-culture', 'culinary', 'nightlife', 'legacy']);
                            filterBtns.forEach(b => {
                                if (b.dataset.filter !== 'all') {
                                    b.classList.add('active');
                                }
                            });
                            this.classList.add('active');
                            this.textContent = 'All On';
                        }
                    } else {
                        // Handle individual theme filters - toggle on/off
                        if (activeThemes.has(filter)) {
                            activeThemes.delete(filter);
                            this.classList.remove('active');
                        } else {
                            activeThemes.add(filter);
                            this.classList.add('active');
                        }

                        // Update "All On/Off" button state
                        updateThemeToggleButtonState();
                    }

                    filterMarkers();
                });
            });

            // Helper function to update theme toggle button state
            function updateThemeToggleButtonState() {
                const allActive = activeThemes.size === 6;
                const noneActive = activeThemes.size === 0;

                if (allActive) {
                    themeToggleAll.classList.add('active');
                    themeToggleAll.textContent = 'All On';
                } else if (noneActive) {
                    themeToggleAll.classList.remove('active');
                    themeToggleAll.textContent = 'All Off';
                } else {
                    themeToggleAll.classList.remove('active');
                    themeToggleAll.textContent = 'All Off';
                }
            }

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

                    // Update toggle buttons state
                    updateToggleButtonsState();
                    filterMarkers();
                });
            });

            // Category toggle all button
            if (categoryToggleAll) {
                categoryToggleAll.addEventListener('click', function() {
                    const isActive = this.classList.contains('active');
                    if (isActive) {
                        // Turn all off
                        activeCategories.clear();
                        categoryFilterBtns.forEach(btn => btn.classList.remove('active'));
                        this.classList.remove('active');
                        this.textContent = 'All Off';
                    } else {
                        // Turn all on
                        activeCategories = new Set(['province', 'city', 'seaside', 'beach', 'ski', 'park', 'storyteller']);
                        categoryFilterBtns.forEach(btn => btn.classList.add('active'));
                        this.classList.add('active');
                        this.textContent = 'All On';
                    }
                    filterMarkers();
                });
            }

            // Helper function to update toggle buttons state
            function updateToggleButtonsState() {
                const allActive = activeCategories.size === 7;
                const noneActive = activeCategories.size === 0;

                if (allActive) {
                    categoryToggleAll.classList.add('active');
                    categoryToggleAll.textContent = 'All On';
                } else if (noneActive) {
                    categoryToggleAll.classList.remove('active');
                    categoryToggleAll.textContent = 'All Off';
                } else {
                    categoryToggleAll.classList.remove('active');
                    categoryToggleAll.textContent = 'All Off';
                }
            }
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

            // Storyteller data for modal
            const storytellerData = {
                'mogens-lena': {
                    title: "Dine with the priests Mogens & Lena in a historical mansion",
                    image: "https://sverigeagenten.com/wp-content/uploads/2021/04/Priest-couple-Staircase-scaled_small-uai-258x172.jpg",
                    content: `
                        <p>This is the story of two priests - Mogens & Lena - who found the perfect place to host intimate gatherings that blend spirituality, history, and culinary excellence in their beautifully restored mansion.</p>
                        <p>Nestled in the Swedish countryside, their historical mansion tells centuries of stories through its walls. Mogens and Lena have transformed this sacred space into a destination where guests can experience authentic Swedish hospitality, meaningful conversations, and exquisite locally-sourced cuisine.</p>
                        <p>Each dining experience is a carefully orchestrated journey through Swedish traditions, seasonal ingredients, and the profound connection between place, people, and purpose. Their gatherings are intimate by design, creating space for reflection, connection, and transformation.</p>
                    `,
                    cta: "Design with LIV",
                    contextType: "storyteller",
                    contextName: "Mogens & Lena"
                },
                'robert-mikael': {
                    title: "THE VILLA – A bizarre dinner gathering with Robert & Mikael",
                    image: "https://sverigeagenten.com/wp-content/uploads/2021/04/Founders-OOOW-Profile-scaled_small-uai-258x172.jpg",
                    content: `
                        <p>With the slogan "Louder music, Less conversations" Robert Pihl and Mikael Wennerros create unforgettable evenings where sound, atmosphere, and unexpected encounters take center stage.</p>
                        <p>THE VILLA is not your typical dinner party. It's an immersive experience where boundaries blur between performance art, culinary excellence, and social experimentation. The duo believes in the power of sound to create connection, letting music speak where words often fail.</p>
                        <p>Guests arrive not knowing what to expect and leave transformed by an evening that challenges convention. Each gathering is unique, carefully curated to surprise, delight, and push the boundaries of what a dinner party can be.</p>
                    `,
                    cta: "Design with LIV",
                    contextType: "storyteller",
                    contextName: "Robert & Mikael"
                },
                'trend-stefan': {
                    title: "A Stockholm design tour with Trend Stefan",
                    image: "https://sverigeagenten.com/wp-content/uploads/2021/04/Potrait-Trendstefan-scaled_small-uai-258x172.jpg",
                    content: `
                        <p>Trend Stefan is recognized as one of the foremost trend scouts of Sweden and he reveals the hidden design gems, emerging studios, and creative spaces that define Stockholm's innovative spirit.</p>
                        <p>With decades of experience in Swedish design, Stefan has his finger on the pulse of Stockholm's creative scene. He knows the studios before they're famous, the designers before they break through, and the spaces where innovation happens.</p>
                        <p>His tours are not about visiting tourist attractions—they're about understanding the DNA of Swedish design. From underground workshops to cutting-edge showrooms, Stefan opens doors that remain closed to most visitors, offering insights into the philosophy, process, and people behind Sweden's design revolution.</p>
                    `,
                    cta: "Design with LIV",
                    contextType: "storyteller",
                    contextName: "Trend Stefan"
                }
            };

            // Make storytellerData available globally
            window.storytellerData = storytellerData;

            // Open modal when read-more button is clicked (skip if page has custom handlers)
            if (!window.SKIP_GLOBAL_PILLAR_MODALS) {
                document.querySelectorAll('.read-more-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        // Check if it's a pillar card or story card
                        const pillarCard = this.closest('.pillar-card');
                        const storyCard = this.closest('.story-card');

                        let data = null;

                        if (pillarCard) {
                            // Check if it's a storyteller card first
                            if (pillarCard.dataset.storyteller) {
                                const storytellerType = pillarCard.dataset.storyteller;
                                data = storytellerData[storytellerType];
                            } else {
                                const pillarType = pillarCard.dataset.pillar;
                                data = pillarData[pillarType];
                            }
                        } else if (storyCard) {
                            const storytellerType = storyCard.dataset.storyteller;
                            data = storytellerData[storytellerType];
                        }

                        if (data && pillarModal && modalTitle && modalImage && modalDescription && modalCta) {
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
                            document.documentElement.style.overflow = 'hidden';
                        }
                    });
                });
            }

            // Close modal
            function closePillarModal() {
                if (pillarModal) {
                    pillarModal.style.display = 'none';
                    document.documentElement.style.overflow = '';
                }
            }

            modalClose?.addEventListener('click', closePillarModal);
            modalOverlay?.addEventListener('click', closePillarModal);

            // Close on Escape key
            if (pillarModal) {
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && pillarModal.style.display === 'flex') {
                        closePillarModal();
                    }
                });
            }

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

            // Load blog posts for journal section
            loadJournalPosts();

            // Load storytellers from CMS
            loadStorytellers();

            // Load pillars from CMS
            loadPillars();
        });

// ==========================================
// JOURNAL / BLOG POSTS FUNCTIONALITY
// ==========================================
async function loadJournalPosts() {
    const journalGrid = document.getElementById('journalGrid');
    if (!journalGrid) return; // Only run on pages with journal grid

    try {
        // Check if Supabase is available
        if (!window.Supabase || !window.Supabase.db) {
            console.warn('Supabase not available, keeping static journal posts');
            return;
        }

        // Fetch published blog posts
        const posts = await window.Supabase.db.getBlogPosts(true);

        if (posts && posts.length > 0) {
            // Sort by published date (newest first) and take top 3
            const recentPosts = posts
                .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
                .slice(0, 3);

            // Replace static content with dynamic blog posts
            journalGrid.innerHTML = recentPosts.map(post => {
                // Set background image style or use placeholder gradient
                const bgStyle = post.hero_image_url
                    ? `background-image: url('${escapeHtml(post.hero_image_url)}'); background-size: cover; background-position: center;`
                    : `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;

                return `
                    <article class="story-card" data-story="${post.slug}" aria-label="${escapeHtml(post.title)}" style="${bgStyle}">
                        <div class="story-meta">
                            <span class="eyebrow" style="margin-bottom:0.5rem;">${escapeHtml(post.author || 'LIV Team')}</span>
                            <h3>${escapeHtml(post.title)}</h3>
                            <p>${escapeHtml(post.excerpt || '')}</p>
                            <a href="/journal-post.html?slug=${encodeURIComponent(post.slug)}" class="story-cta" style="display: inline-block; margin-top: 1rem; color: inherit; text-decoration: none; font-weight: 600;">Read More →</a>
                        </div>
                    </article>
                `;
            }).join('');

            // Add "View All" link if there are more posts
            if (posts.length > 3) {
                const viewAllCard = `
                    <article class="story-card" style="display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.03);">
                        <div class="story-meta" style="text-align: center;">
                            <h3>View All Journal Posts</h3>
                            <p>Explore more stories and travel insights</p>
                            <a href="/journal.html" class="story-cta" style="display: inline-block; margin-top: 1rem; color: inherit; text-decoration: none; font-weight: 600;">View All →</a>
                        </div>
                    </article>
                `;
                journalGrid.innerHTML += viewAllCard;
            }
        }
    } catch (error) {
        console.error('Error loading journal posts:', error);
        // Keep static content if there's an error
    }
}

// Helper function for escaping HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// STORYTELLERS FUNCTIONALITY
// ==========================================
async function loadStorytellers() {
    const storiesGrid = document.querySelector('#storytellers .stories-grid');
    if (!storiesGrid) return; // Only run on pages with storytellers section

    try {
        // Check if Supabase is available
        if (!window.Supabase || !window.Supabase.db) {
            console.warn('Supabase not available, keeping static storytellers');
            return;
        }

        // Fetch published stories
        const stories = await window.Supabase.db.getStories(true);

        if (stories && stories.length > 0) {
            // Sort by display_order and published date, take top 3 for homepage
            const featuredStories = stories
                .sort((a, b) => {
                    // First sort by display_order if both have it
                    if (a.display_order !== null && b.display_order !== null) {
                        return a.display_order - b.display_order;
                    }
                    // If only one has display_order, prioritize it
                    if (a.display_order !== null) return -1;
                    if (b.display_order !== null) return 1;
                    // Otherwise sort by date (newest first)
                    return new Date(b.published_at) - new Date(a.published_at);
                })
                .slice(0, 3);

            // Generate slug from title for data attribute
            function generateSlug(title) {
                return title.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            // Replace static content with CMS stories
            storiesGrid.innerHTML = featuredStories.map(story => {
                const slug = generateSlug(story.title);
                const imageUrl = story.hero_image_url || 'https://via.placeholder.com/258x172';

                return `
                    <article class="story-card" data-storyteller="${slug}">
                        <div class="story-media">
                            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(story.title)}" loading="lazy">
                        </div>
                        <div class="story-content">
                            <h3 class="story-title">${escapeHtml(story.title)}</h3>
                            <p class="story-excerpt">${escapeHtml(story.excerpt || '')}</p>
                            <button type="button" class="read-more-btn">read more</button>
                            <button type="button" class="story-cta" data-open-liv data-liv-context-type="storyteller" data-liv-context-name="${escapeHtml(story.title)}">Design with LIV</button>
                        </div>
                    </article>
                `;
            }).join('');

            // Update storytellerData object with CMS data
            const storytellerData = {};
            featuredStories.forEach(story => {
                const slug = generateSlug(story.title);
                storytellerData[slug] = {
                    title: story.title,
                    image: story.hero_image_url || 'https://via.placeholder.com/258x172',
                    content: story.content || `<p>${story.excerpt}</p>`,
                    cta: "Design with LIV",
                    contextType: "storyteller",
                    contextName: story.title
                };
            });

            // Update the global storytellerData if it exists
            if (window.storytellerData) {
                Object.assign(window.storytellerData, storytellerData);
            } else {
                window.storytellerData = storytellerData;
            }

            // Re-initialize read-more button handlers for new content
            initializeReadMoreButtons();

            // NOTE: No need to attach event listeners here - the global [data-open-liv] handler
            // in the main DOMContentLoaded listener already handles all LIV buttons
        }
    } catch (error) {
        console.error('Error loading storytellers:', error);
        // Keep static content if there's an error
    }
}

// Initialize read-more buttons (called after loading storytellers)
function initializeReadMoreButtons() {
    // Skip if page has its own modal initialization
    if (window.SKIP_GLOBAL_PILLAR_MODALS) {
        return;
    }

    const pillarModal = document.getElementById('pillarModal');
    const modalTitle = document.querySelector('#pillarModal .pillar-modal-title');
    const modalImage = document.querySelector('#pillarModal .pillar-modal-image');
    const modalDescription = document.querySelector('#pillarModal .pillar-modal-description');
    const modalCta = document.querySelector('#pillarModal .pillar-modal-cta');

    if (!pillarModal) return;

    // Remove old event listeners by cloning and replacing
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', function() {
            const storyCard = this.closest('.story-card');

            if (storyCard) {
                const storytellerType = storyCard.dataset.storyteller;
                const data = window.storytellerData?.[storytellerType];

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
                    document.documentElement.style.overflow = 'hidden';
                }
            }
        });
    });
}

// ==========================================
// PILLARS FUNCTIONALITY
// ==========================================
async function loadPillars() {
    try {
        // Check if Supabase is available
        if (!window.Supabase || !window.Supabase.db) {
            console.warn('Supabase not available, keeping static pillars');
            return;
        }

        // Load both experiences and corporate pillars
        const [experiencesPillars, corporatePillars] = await Promise.all([
            window.Supabase.db.getPillars('experiences', true),
            window.Supabase.db.getPillars('corporate', true)
        ]);

        // Update Experiences section
        if (experiencesPillars && experiencesPillars.length > 0) {
            updatePillarsSection('journeys', experiencesPillars, 'experiences');
        }

        // Update Corporate & Incentives section
        if (corporatePillars && corporatePillars.length > 0) {
            updatePillarsSection('corporate', corporatePillars, 'corporate');
        }

        // Re-initialize read-more buttons and modal system after DOM updates
        setTimeout(() => {
            initializePillarModals();
        }, 100);

    } catch (error) {
        console.error('Error loading pillars:', error);
        // Keep static content if there's an error
    }
}

function updatePillarsSection(sectionId, pillars, section) {
    const pillarsGrid = document.querySelector(`#${sectionId} .pillars-grid`);
    if (!pillarsGrid) {
        console.warn(`Pillars grid not found for section: ${sectionId}`);
        return;
    }

    // Check if already loaded to prevent re-rendering and flashing
    if (pillarsGrid.dataset.cmsLoaded === 'true') {
        console.log(`${sectionId} already loaded from CMS, skipping update`);
        return;
    }

    console.log(`Updating ${sectionId} with ${pillars.length} pillars from CMS`);

    // Generate pillar cards HTML
    const newHTML = pillars.map(pillar => {
        const imageUrl = pillar.hero_image_url || 'https://via.placeholder.com/1920x1280';
        const iconName = pillar.icon_name || 'star';

        return `
            <article class="pillar-card" data-pillar="${pillar.slug}">
                <div class="pillar-media" aria-hidden="true">
                    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(pillar.title)}" loading="lazy">
                </div>
                <div class="pillar-body">
                    <div class="pillar-icon" aria-hidden="true"><i data-lucide="${escapeHtml(iconName)}"></i></div>
                    <div class="pillar-copy">
                        <h3>${escapeHtml(pillar.title)}</h3>
                        <p>${escapeHtml(pillar.excerpt)}</p>
                        <button type="button" class="read-more-btn">read more</button>
                        <button type="button" class="pillar-cta" data-open-liv data-liv-context-type="${escapeHtml(pillar.liv_context_type)}" data-liv-context-name="${escapeHtml(pillar.liv_context_name)}">${escapeHtml(pillar.cta_text)}</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    // Update the DOM
    pillarsGrid.innerHTML = newHTML;

    // Mark as loaded to prevent future re-renders causing flashing
    pillarsGrid.dataset.cmsLoaded = 'true';

    // Reinitialize Lucide icons for the new content
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

    // NOTE: No need to attach event listeners here - the global [data-open-liv] handler
    // in the main DOMContentLoaded listener already handles all LIV buttons

    // Store pillar data globally for modal access
    if (!window.pillarDataCMS) {
        window.pillarDataCMS = {};
    }

    pillars.forEach(pillar => {
        window.pillarDataCMS[pillar.slug] = {
            title: pillar.title,
            image: pillar.hero_image_url,
            content: pillar.content,
            cta: pillar.cta_text,
            contextType: pillar.liv_context_type,
            contextName: pillar.liv_context_name
        };
    });

    console.log(`Stored CMS data for ${Object.keys(window.pillarDataCMS).length} pillars:`, Object.keys(window.pillarDataCMS));
}

function initializePillarModals() {
    // Skip if page has its own modal initialization
    if (window.SKIP_GLOBAL_PILLAR_MODALS) {
        console.log('Skipping global pillar modal initialization (page has custom handlers)');
        return;
    }

    console.log('Initializing pillar modals...');

    const pillarModal = document.getElementById('pillarModal');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');
    const modalCta = document.getElementById('modal-cta');

    if (!pillarModal) {
        console.error('Pillar modal not found in DOM');
        return;
    }

    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    console.log(`Found ${readMoreButtons.length} read-more buttons`);
    console.log('Available CMS pillar data:', window.pillarDataCMS ? Object.keys(window.pillarDataCMS) : 'none');
    console.log('Available hardcoded pillar data:', window.pillarData ? Object.keys(window.pillarData) : 'none');
    console.log('Available storyteller data:', window.storytellerData ? Object.keys(window.storytellerData) : 'none');

    // Remove old event listeners by cloning and replacing
    readMoreButtons.forEach((btn, index) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', function() {
            console.log(`Read more button ${index} clicked`);

            const pillarCard = this.closest('.pillar-card');
            const storyCard = this.closest('.story-card');

            let data = null;
            let slug = null;

            if (pillarCard) {
                // Check if it's a storyteller card first
                if (pillarCard.dataset.storyteller) {
                    slug = pillarCard.dataset.storyteller;
                    console.log(`Storyteller pillar card clicked with slug: ${slug}`);
                    data = window.storytellerData?.[slug];
                    console.log(`Found storyteller data:`, data ? 'YES' : 'NO');
                } else {
                    slug = pillarCard.dataset.pillar;
                    console.log(`Pillar card clicked with slug: ${slug}`);
                    // First check CMS data, then fall back to hardcoded data
                    data = window.pillarDataCMS?.[slug] || window.pillarData?.[slug];
                    console.log(`Found pillar data:`, data ? 'YES' : 'NO');
                }
            } else if (storyCard) {
                slug = storyCard.dataset.storyteller;
                console.log(`Story card clicked with slug: ${slug}`);
                data = window.storytellerData?.[slug];
                console.log(`Found storyteller data:`, data ? 'YES' : 'NO');
            }

            if (data) {
                console.log('Opening modal with data:', data.title);
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
                document.documentElement.style.overflow = 'hidden';
            } else {
                console.error(`No data found for slug: ${slug}`);
            }
        });
    });

    console.log('Pillar modal initialization complete');
}

// NOTE: Menu initialization moved to menu-init.js
// Smooth scroll is also handled there
