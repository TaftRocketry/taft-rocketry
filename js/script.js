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
