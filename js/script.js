const navLinks = document.querySelector(".nav-links");
const pageContainer = document.querySelector("[data-page-container]");
const pageCache = new Map();
let textStackHandler = null;
let lottieHandler = null;
let lottieResizeHandler = null;

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
    const interval = 40;
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
                { label: "Apogee", value: "12,300 ft" },
                { label: "Motor", value: "J-Class" },
                { label: "Status", value: "Retired" },
            ],
        },
        {
            name: "Gold Rush",
            description:
                "Our last flight article tuned for consistent avionics and smoother separation dynamics in high winds.",
            image: "images/goldrush.JPG",
            theme: "theme-gold",
            stats: [
                { label: "Apogee", value: "18,950 ft" },
                { label: "Motor", value: "K-Class" },
                { label: "Status", value: "Last Rocket" },
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

    const renderStats = (stats) => {
        if (!statsWrap) {
            return;
        }
        statsWrap.innerHTML = "";
        stats.forEach((stat) => {
            const block = document.createElement("div");
            block.className = "spec-block";
            const label = document.createElement("span");
            label.className = "spec-label";
            label.textContent = stat.label;
            const value = document.createElement("p");
            value.textContent = stat.value;
            block.append(label, value);
            statsWrap.append(block);
        });
    };

    const updateRocket = (nextIndex) => {
        const count = rockets.length;
        currentIndex = (nextIndex + count) % count;
        const rocket = rockets[currentIndex];
        nameEl.textContent = rocket.name;
        descriptionEl.textContent = rocket.description;
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

    updateRocket(0);
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
    const frameCount = 381;
    const imageCache = new Map();
    const queued = new Set();
    const loadQueue = [];
    const maxConcurrentLoads = 6;
    const prefetchRadius = 6;
    let activeLoads = 0;
    let lastFrame = -1;
    let lastDrawn = -1;
    let cssWidth = 0;
    let cssHeight = 0;

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
        cssHeight = Math.max(1, rect.height);
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (lastFrame >= 0) {
            drawFrame(lastFrame);
        }
    };

    const drawFrame = (index) => {
        const image = imageCache.get(index);
        if (!image) {
            return;
        }
        context.clearRect(0, 0, cssWidth, cssHeight);
        const scale = Math.max(cssWidth / image.width, cssHeight / image.height);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        const x = (cssWidth - drawWidth) / 2;
        const y = (cssHeight - drawHeight) / 2;
        context.drawImage(image, x, y, drawWidth, drawHeight);
        lastDrawn = index;
    };

    const processQueue = () => {
        while (activeLoads < maxConcurrentLoads && loadQueue.length > 0) {
            const index = loadQueue.shift();
            if (index === undefined) {
                return;
            }
            activeLoads += 1;
            const img = new Image();
            img.onload = () => {
                activeLoads -= 1;
                queued.delete(index);
                imageCache.set(index, img);
                if (index === lastFrame) {
                    drawFrame(index);
                }
                processQueue();
            };
            img.onerror = () => {
                activeLoads -= 1;
                queued.delete(index);
                processQueue();
            };
            img.src = `lottie_images/img_${index}.jpg`;
        }
    };

    const queueFrame = (index) => {
        if (index < 0 || index >= frameCount) {
            return;
        }
        if (imageCache.has(index) || queued.has(index)) {
            return;
        }
        queued.add(index);
        loadQueue.push(index);
        processQueue();
    };

    const queueRange = (center) => {
        for (let i = center - prefetchRadius; i <= center + prefetchRadius; i += 1) {
            queueFrame(i);
        }
    };

    const updateFrame = () => {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        let progress = 0;

        if (textStack) {
            const rect = textStack.getBoundingClientRect();
            const start = window.scrollY + rect.top;
            const height = rect.height || 1;
            const anchor = window.scrollY + viewportHeight / 2;
            progress = Math.min(1, Math.max(0, (anchor - start) / height));
        } else {
            const scrollable = Math.max(1, document.body.scrollHeight - viewportHeight);
            progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
        }

        const frameIndex = Math.round(progress * (frameCount - 1));
        if (frameIndex === lastFrame) {
            return;
        }
        lastFrame = frameIndex;
        queueRange(frameIndex);
        if (imageCache.has(frameIndex)) {
            drawFrame(frameIndex);
        } else if (lastDrawn >= 0 && imageCache.has(lastDrawn)) {
            drawFrame(lastDrawn);
        }
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
    queueRange(0);
    window.addEventListener("scroll", lottieHandler);
    window.addEventListener("resize", lottieResizeHandler);
    lottieHandler();
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
