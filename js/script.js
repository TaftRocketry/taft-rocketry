const navLinks = document.querySelector(".nav-links");
const pageContainer = document.querySelector("[data-page-container]");
const pageCache = new Map();
let textStackHandler = null;

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

const loadPage = async (pageName, src) => {
    if (!pageContainer) {
        return;
    }
    if (pageCache.has(pageName)) {
        pageContainer.innerHTML = pageCache.get(pageName);
        initPageInteractions();
        initTextStack();
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
