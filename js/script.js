const navLinks = document.querySelector(".nav-links");
const pageContainer = document.querySelector("[data-page-container]");
const pageCache = new Map();
let textStackHandler = null;
let lottieHandler = null;
let lottieResizeHandler = null;
let scrollIndicatorHandler = null;
let scrollIndicatorResizeHandler = null;
const scrollLottieFrameCount = 552;
const scrollLottieFrameCache = new Map();
let scrollLottiePreloadPromise = null;
let scrollLottieInitToken = 0;

const preloadScrollLottieFrames = () => {
    if (scrollLottieFrameCache.size === scrollLottieFrameCount) {
        return Promise.resolve(scrollLottieFrameCache);
    }

    if (scrollLottiePreloadPromise) {
        return scrollLottiePreloadPromise;
    }

    const maxConcurrentLoads = 12;
    let nextIndex = 0;

    const loadFrame = (index) => {
        if (scrollLottieFrameCache.has(index)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.decoding = "async";
            if ("fetchPriority" in img) {
                img.fetchPriority = index < 48 ? "high" : "auto";
            }
            img.onload = () => {
                scrollLottieFrameCache.set(index, img);
                resolve();
            };
            img.onerror = () => {
                reject(new Error(`Failed to load scroll Lottie frame ${index + 1}`));
            };

            const frameNumber = String(index + 1).padStart(6, "0");
            img.src = `TestVid2/TestVid2_${frameNumber}.jpg`;
        });
    };

    const worker = async () => {
        while (nextIndex < scrollLottieFrameCount) {
            const index = nextIndex;
            nextIndex += 1;
            await loadFrame(index);
        }
    };

    scrollLottiePreloadPromise = Promise.all(
        Array.from({ length: Math.min(maxConcurrentLoads, scrollLottieFrameCount) }, () => worker())
    )
        .then(() => scrollLottieFrameCache)
        .catch((error) => {
            scrollLottiePreloadPromise = null;
            throw error;
        });

    return scrollLottiePreloadPromise;
};

const setActiveLink = (link) => {
    if (!navLinks) {
        return;
    }
    navLinks.querySelectorAll("a").forEach((navLink) => {
        navLink.classList.toggle("is-active", navLink === link);
    });
};

const initPageInteractions = () => {
    const specsButtons = pageContainer?.querySelectorAll("[data-show-specs]");
    const specsPanels = pageContainer?.querySelectorAll("[data-specs-detail]");
    if (!specsButtons || !specsPanels) {
        return;
    }
    specsButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.dataset.showSpecs;
            if (!target) {
                return;
            }
            specsPanels.forEach((panel) => {
                const panelId = panel.dataset.specsDetail;
                panel.classList.toggle("is-hidden", panelId && panelId !== target);
            });
        });
    });

    initRocketCarousel();
    initTeamTitleScramble();
};

const initTeamTitleScramble = () => {
    const teamSection = pageContainer?.querySelector(".page-team");
    if (!teamSection) {
        return;
    }

    const title = teamSection.querySelector(".section-title");
    if (!title) {
        return;
    }

    scrambleText(title);
};

const scrambleText = (element) => {
    const original = element.textContent || "";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const chars = original.split("");
    let revealIndex = 0;
    let cycles = 0;
    const cyclesPerChar = 6;
    const interval = 38;
    const originalWidth = element.getBoundingClientRect().width;
    if (originalWidth > 0) {
        element.style.display = "inline-block";
        element.style.whiteSpace = "nowrap";
        element.style.width = `${originalWidth}px`;
    }

    const isLetter = (char) => /[A-Za-z]/.test(char);

    const tick = () => {
        while (revealIndex < chars.length && !isLetter(chars[revealIndex])) {
            revealIndex += 1;
        }

        const next = chars.map((char, index) => {
            if (index < revealIndex || !isLetter(char)) {
                return char;
            }
            return letters[Math.floor(Math.random() * letters.length)];
        });

        element.textContent = next.join("");

        if (revealIndex >= chars.length) {
            element.textContent = original;
            window.clearInterval(timer);
            return;
        }

        cycles += 1;
        if (cycles >= cyclesPerChar) {
            cycles = 0;
            revealIndex += 1;
        }
    };

    const timer = window.setInterval(tick, interval);
    tick();
};

const initRocketCarousel = () => {
    const rocketSection = pageContainer?.querySelector(".page-rockets");
    if (!rocketSection) {
        return;
    }

    const rockets = [
        {
            name: "Green Goblin",
            description:
                "A carbon-sleeved, high-impulse vehicle built for stability and clean staging with our current recovery package.",
            image: "images/greengoblin.JPG",
            theme: "theme-goblin",
            stats: [
                { label: "Height", value: "4 ft" },
                { label: "Diameter", value: "2.3 in" },
                { label: "Weight", value: "1.2 kg" },
                { label: "Motor", value: "Homemade" },
                { label: "Max Speed", value: "Mach 0.45" },
                { label: "Apogee", value: "4,000 ft" },
            ],
        },
        {
            name: "Gold Rush",
            description:
                "Our last flight article tuned for consistent avionics and smoother separation dynamics in high winds.",
            image: "images/goldrush.JPG",
            theme: "theme-gold",
            stats: [
                { label: "Height", value: "2.3 ft" },
                { label: "Diameter", value: "1.5 in" },
                { label: "Weight", value: "400 g" },
                { label: "Motor", value: "Homemade" },
                { label: "Max Speed", value: "Mach 0.1" },
                { label: "Apogee", value: "500 ft" },
            ],
        },
        {
            name: "Next Vehicle",
            description:
                "The upcoming design focuses on lighter airframe mass and streamlined ground operations for rapid turnarounds.",
            image: "images/rocketlatest.png",
            theme: "theme-next",
            stats: [
                { label: "Apogee", value: "Target 25,000 ft" },
                { label: "Motor", value: "K-Class" },
                { label: "Status", value: "In Build" },
            ],
        },
    ];

    const nameEl = rocketSection.querySelector("[data-rocket-name]");
    const descriptionEl = rocketSection.querySelector("[data-rocket-description]");
    const imageEl = rocketSection.querySelector("[data-rocket-image]");
    const statsWrap = rocketSection.querySelector("[data-rocket-stats]");
    const heroPanel = rocketSection.querySelector("[data-rocket-hero]");
    const carouselPanel = rocketSection.querySelector("[data-rocket-carousel]");
    const thumbButtons = rocketSection.querySelectorAll("[data-rocket-index]");
    const navButtons = rocketSection.querySelectorAll("[data-rocket-nav]");

    if (!nameEl || !descriptionEl || !imageEl || rockets.length === 0) {
        return;
    }

    let currentIndex = 0;
    const imagePreloadPromises = new Map();

    const preloadRocketImage = (src, priority = "auto") => {
        if (imagePreloadPromises.has(src)) {
            return imagePreloadPromises.get(src);
        }

        const promise = new Promise((resolve) => {
            const preload = new Image();
            preload.decoding = "async";
            if ("fetchPriority" in preload) {
                preload.fetchPriority = priority;
            }
            preload.onload = () => resolve(true);
            preload.onerror = () => resolve(false);
            preload.src = src;
        });

        imagePreloadPromises.set(src, promise);
        return promise;
    };

    const renderStats = (stats) => {
        if (!statsWrap) {
            return;
        }
        statsWrap.innerHTML = "";
        stats.forEach((stat) => {
            const row = document.createElement("div");
            row.className = "spec-row";
            const label = document.createElement("span");
            label.className = "spec-label";
            label.textContent = stat.label;
            const value = document.createElement("span");
            value.className = "spec-value";
            value.textContent = stat.value;
            row.append(label, value);
            statsWrap.append(row);
        });
    };

    const updateRocket = (nextIndex) => {
        const count = rockets.length;
        currentIndex = (nextIndex + count) % count;
        const rocket = rockets[currentIndex];
        nameEl.textContent = rocket.name;
        descriptionEl.textContent = rocket.description;
        imageEl.decoding = "async";
        if ("fetchPriority" in imageEl) {
            imageEl.fetchPriority = "high";
        }
        imageEl.src = rocket.image;
        imageEl.alt = `${rocket.name} rocket`;
        renderStats(rocket.stats);
        if (heroPanel && carouselPanel) {
            const theme = rocket.theme || "";
            heroPanel.dataset.theme = theme;
            carouselPanel.dataset.theme = theme;
        }

        thumbButtons.forEach((button) => {
            const index = Number.parseInt(button.dataset.rocketIndex || "", 10);
            if (Number.isNaN(index)) {
                return;
            }
            button.classList.toggle("is-current", index === currentIndex);
        });
    };

    thumbButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const target = Number.parseInt(button.dataset.rocketIndex || "", 10);
            if (Number.isNaN(target)) {
                return;
            }
            updateRocket(target);
        });
    });

    navButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const direction = button.dataset.rocketNav;
            updateRocket(direction === "next" ? currentIndex + 1 : currentIndex - 1);
        });
    });

    rockets.forEach((rocket, index) => {
        preloadRocketImage(rocket.image, index === 0 ? "high" : "auto");
    });

    updateRocket(0);
};

const initScrollIndicator = () => {
    if (scrollIndicatorHandler) {
        window.removeEventListener("scroll", scrollIndicatorHandler);
        scrollIndicatorHandler = null;
    }
    if (scrollIndicatorResizeHandler) {
        window.removeEventListener("resize", scrollIndicatorResizeHandler);
        scrollIndicatorResizeHandler = null;
    }

    const indicator = pageContainer?.querySelector(".scroll-indicator");
    if (!indicator) {
        document.body.classList.remove("has-scroll-indicator");
        return;
    }

    document.body.classList.add("has-scroll-indicator");

    const progressFill = indicator.querySelector("[data-scroll-fill]");
    const list = indicator.querySelector("[data-scroll-list]");
    if (!list) {
        return;
    }

    const textStack = pageContainer?.querySelector(".text-stack");
    const textBoxes = textStack ? Array.from(textStack.querySelectorAll(".text-box")) : [];
    const sectionElements = Array.from(pageContainer.querySelectorAll("[data-scroll-title]"));
    const sections = sectionElements
        .map((element) => {
            const title = element.dataset.scrollTitle?.trim();
            if (!title) {
                return null;
            }
            return {
                element,
                title,
                isTextBox: element.classList.contains("text-box"),
                start: Number.parseFloat(element.dataset.start || ""),
            };
        })
        .filter(Boolean);

    list.innerHTML = "";
    const buttons = sections.map((section, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "scroll-title";
        button.textContent = section.title;
        button.dataset.scrollIndex = index.toString();
        list.append(button);
        return button;
    });

    const getStackMetrics = () => {
        if (!textStack || textBoxes.length === 0) {
            return null;
        }
        const rect = textStack.getBoundingClientRect();
        const stackTop = window.scrollY + rect.top;

       
        const stackHeight = rect.height || 1;
        const fallbackSegment = stackHeight / textBoxes.length;
        return { stackTop, stackHeight, fallbackSegment };
    };

    const getSectionTop = (section, index, stackMetrics) => {
        if (section.isTextBox && stackMetrics) {
            const start = Number.isFinite(section.start)
                ? section.start
                : index * stackMetrics.fallbackSegment;
            return stackMetrics.stackTop + start;
        }
        const rect = section.element.getBoundingClientRect();
        return window.scrollY + rect.top;
    };

    let sectionProgresses = [];

    const syncButtonPositions = () => {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const scrollable = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
        const stackMetrics = getStackMetrics();
        const listHeight = list.getBoundingClientRect().height || 1;
        const bar = indicator.querySelector(".scroll-progress-bar");
        if (bar) {
            bar.style.height = `${listHeight}px`;
        }
        sectionProgresses = sections.map((section, index) => {
            const top = getSectionTop(section, index, stackMetrics);
            const progress = Math.min(1, Math.max(0, top / scrollable));
            const offset = index === sections.length - 1 ? -1 : 0;
            buttons[index].style.top = `${(progress * 100 + offset).toFixed(2)}%`;
            return progress;
        });
    };

    list.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-scroll-index]");
        if (!button) {
            return;
        }
        const index = Number.parseInt(button.dataset.scrollIndex || "", 10);
        if (Number.isNaN(index) || !sections[index]) {
            return;
        }
        const stackMetrics = getStackMetrics();
        const targetTop = getSectionTop(sections[index], index, stackMetrics);
        window.scrollTo({ top: targetTop, behavior: "smooth" });
    });

    let ticking = false;

    const update = () => {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const scrollable = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
        const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
        const progressPercent = Math.round(progress * 100);
        if (progressFill) {
            progressFill.style.height = `${progressPercent}%`;
        }
        

        let activeIndex = 0;
        if (sectionProgresses.length > 0) {
            sectionProgresses.forEach((sectionProgress, index) => {
                if (sectionProgress <= progress + 0.0001) {
                    activeIndex = index;
                }
            });
        }

        buttons.forEach((button, index) => {
            button.classList.toggle("is-active", index === activeIndex);
        });
    };

    scrollIndicatorHandler = () => {
        if (ticking) {
            return;
        }
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            update();
        });
    };

    scrollIndicatorResizeHandler = () => {
        syncButtonPositions();
        update();
    };

    window.addEventListener("scroll", scrollIndicatorHandler);
    window.addEventListener("resize", scrollIndicatorResizeHandler);
    syncButtonPositions();
    update();
};

const initTextStack = () => {
    if (textStackHandler) {
        window.removeEventListener("scroll", textStackHandler);
        window.removeEventListener("resize", textStackHandler);
        textStackHandler = null;
    }

    const textStack = pageContainer?.querySelector(".text-stack");
    const boxes = textStack ? Array.from(textStack.querySelectorAll(".text-box")) : [];
    if (!textStack || boxes.length === 0) {
        return;
    }

    let ticking = false;
    const update = () => {
        const rect = textStack.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const stackTop = window.scrollY + rect.top;
        const stackHeight = rect.height || 1;
        const anchor = window.scrollY + viewportHeight / 2;
        const relative = Math.min(stackHeight, Math.max(0, anchor - stackTop));
        const fallbackSegment = stackHeight / boxes.length;

        boxes.forEach((box, index) => {
            const start = Number.parseFloat(box.dataset.start);
            const end = Number.parseFloat(box.dataset.end);
            const rangeStart = Number.isFinite(start) ? start : index * fallbackSegment;
            const rangeEnd = Number.isFinite(end) ? end : rangeStart + fallbackSegment;
            const rangeSize = Math.max(1, rangeEnd - rangeStart);
            const local = (relative - rangeStart) / rangeSize;
            let opacity = 0;
            let yPercent = 5;

            if (local >= 0 && local <= 1) {
                if (local < 0.2) {
                    const t = local / 0.2;
                    opacity = t;
                    yPercent = 5 - t * 5;
                } else if (local > 0.8) {
                    const t = (local - 0.8) / 0.2;
                    opacity = 1 - t;
                    yPercent = -t * 5;
                } else {
                    opacity = 1;
                    yPercent = 0;
                }
            }

            box.style.opacity = opacity.toFixed(3);
            box.style.transform = `translateY(calc(-50% + ${yPercent.toFixed(2)}%))`;
            box.style.zIndex = Math.round(opacity * 10).toString();
        });
    };

    textStackHandler = () => {
        if (ticking) {
            return;
        }
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            update();
        });
    };

    window.addEventListener("scroll", textStackHandler);
    window.addEventListener("resize", textStackHandler);
    textStackHandler();
};

const initScrollLottie = () => {
    const initToken = ++scrollLottieInitToken;

    if (lottieHandler) {
        window.removeEventListener("scroll", lottieHandler);
        lottieHandler = null;
    }
    if (lottieResizeHandler) {
        window.removeEventListener("resize", lottieResizeHandler);
        lottieResizeHandler = null;
    }

    const lottieHost = pageContainer?.querySelector(".scroll-lottie");
    if (!lottieHost) {
        return;
    }

    const textStack = pageContainer?.querySelector(".text-stack");
    let lastFrame = -1;
    let cssWidth = 0;
    let cssHeight = 0;
    const verticalOverflow = 240;

    lottieHost.classList.add("is-loading");
    lottieHost.classList.remove("is-ready");
    lottieHost.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.className = "scroll-lottie-canvas";
    lottieHost.appendChild(canvas);

    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }

    const updateCanvasSize = () => {
        const rect = lottieHost.getBoundingClientRect();
        cssWidth = Math.max(1, rect.width);
        cssHeight = Math.max(1, rect.height + verticalOverflow);
        canvas.style.height = `calc(100% + ${verticalOverflow}px)`;
        canvas.style.transform = `translateY(${-verticalOverflow / 2}px)`;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (lastFrame >= 0) {
            drawFrame(lastFrame);
        }
    };

    const drawFrame = (index) => {
        const image = scrollLottieFrameCache.get(index);
        if (!image) {
            return;
        }
        context.clearRect(0, 0, cssWidth, cssHeight);
        const scale = 1;
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        const x = (cssWidth - drawWidth) / 2;
        const y = 70;
        context.drawImage(image, x, y, drawWidth, drawHeight);
    };

    const updateFrame = () => {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        let progress = 0;

        if (textStack) {
            const rect = textStack.getBoundingClientRect();
            const start = window.scrollY + rect.top;
            const height = rect.height || 1;
            const scrollRange = Math.max(1, height - viewportHeight);
            const anchor = window.scrollY;
            progress = Math.min(1, Math.max(0, (anchor - start) / scrollRange));
        } else {
            const scrollable = Math.max(1, document.body.scrollHeight - viewportHeight);
            progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
        }

        const frameIndex = Math.round(progress * (scrollLottieFrameCount - 1));

        if (frameIndex === lastFrame) {
            return;
        }
        lastFrame = frameIndex;
        drawFrame(frameIndex);
    };

    let ticking = false;
    lottieHandler = () => {
        if (ticking) {
            return;
        }
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            updateFrame();
        });
    };

    lottieResizeHandler = () => {
        updateCanvasSize();
        updateFrame();
    };

    updateCanvasSize();
    preloadScrollLottieFrames()
        .then(() => {
            if (initToken !== scrollLottieInitToken || !lottieHost.isConnected) {
                return;
            }

            lottieHost.classList.remove("is-loading");
            lottieHost.classList.add("is-ready");
            drawFrame(0);
            window.addEventListener("scroll", lottieHandler);
            window.addEventListener("resize", lottieResizeHandler);
            lottieHandler();
        })
        .catch(() => {
            if (initToken !== scrollLottieInitToken || !lottieHost.isConnected) {
                return;
            }

            lottieHost.classList.add("is-loading");
            lottieHost.classList.remove("is-ready");
        });
};

const loadPage = async (pageName, src) => {
    if (!pageContainer) {
        return;
    }
    if (pageCache.has(pageName)) {
        pageContainer.innerHTML = pageCache.get(pageName);
        initPageInteractions();
        initTextStack();
        initScrollLottie();
        initScrollIndicator();
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        return;
    }
    try {
        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Failed to load ${pageName}`);
        }
        const html = await response.text();
        pageCache.set(pageName, html);
        pageContainer.innerHTML = html;
        initPageInteractions();
        initTextStack();
        initScrollLottie();
        initScrollIndicator();
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (error) {
        pageContainer.textContent = `Unable to load ${pageName}.`;
    }
};

const getLinkForPage = (pageName) => {
    return navLinks?.querySelector(`a[data-page="${pageName}"]`);
};

if (navLinks) {
    navLinks.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-page][data-src]");
        if (!link) {
            return;
        }
        event.preventDefault();
        const pageName = link.dataset.page;
        const src = link.dataset.src;
        loadPage(pageName, src);
        history.replaceState(null, "", link.getAttribute("href"));
        setActiveLink(link);
    });
}

const initialPage = window.location.hash.replace("#", "") || "home";
const initialLink = getLinkForPage(initialPage) || navLinks?.querySelector("a[data-page][data-src]");
if (initialLink) {
    loadPage(initialLink.dataset.page, initialLink.dataset.src);
    setActiveLink(initialLink);
}
