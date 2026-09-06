const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
const pageProgress = document.getElementById("pageProgress");
const year = document.getElementById("year");
const hero = document.getElementById("inicio");

const navLinks = Array.from(document.querySelectorAll(".nav a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const revealElements = Array.from(document.querySelectorAll(".reveal"));

const heroContent = document.querySelector(".hero-content");
const heroVisual = document.querySelector(".hero-visual");
const heroDecoration = document.querySelector(".hero-decoration");
const photoFrame = document.querySelector(".photo-frame");
const codeCard = document.querySelector(".code-card");
const footer = document.querySelector(".footer");

const skillCards = Array.from(
    document.querySelectorAll(".skill-card")
);

const projects = Array.from(
    document.querySelectorAll(".project")
);

const educationItems = Array.from(
    document.querySelectorAll(".education-item")
);

const numberCards = Array.from(
    document.querySelectorAll(".about-numbers > div")
);

const contactLinks = Array.from(
    document.querySelectorAll(".contact-links a")
);

const headings = Array.from(
    document.querySelectorAll(
        ".section-heading h2, .about-content h2, .education h2, .contact h2"
    )
);

const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
);

const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

const lerp = (a, b, t) =>
    a + (b - a) * t;

let scrollFrame = null;


/* =========================================
   SEÇÃO ATUAL
========================================= */

function getSectionAtPosition(position) {

    let current = null;

    sections.forEach((section) => {

        const top =
            section.offsetTop;

        const bottom =
            top +
            section.offsetHeight;

        if (
            position >= top &&
            position < bottom
        ) {
            current = section;
        }

    });

    return current;

}


/* =========================================
   PROGRESS BAR
========================================= */

function updateProgress() {

    if (!pageProgress) {
        return;
    }

    const max =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const progress =
        max > 0
            ? (window.scrollY / max) * 100
            : 0;

    pageProgress.style.width =
        `${clamp(progress, 0, 100)}%`;

}


/* =========================================
   NAV ATIVA
========================================= */

function updateActiveNav() {

    const position =
        window.scrollY +
        Math.min(
            window.innerHeight * 0.35,
            250
        );

    const current =
        getSectionAtPosition(position);

    navLinks.forEach((link) => {
        link.classList.remove("active");
    });

    if (!current) {
        return;
    }

    const active =
        navLinks.find(
            (link) =>
                link.getAttribute("href") ===
                `#${current.id}`
        );

    if (active) {
        active.classList.add("active");
    }

}


/* =========================================
   HEADER CLARO / ESCURO
========================================= */

function updateHeaderTheme() {

    if (!header) {
        return;
    }

    const current =
        getSectionAtPosition(
            window.scrollY + 40
        );

    header.classList.toggle(
        "light",
        Boolean(
            current &&
            [
                "sobre",
                "formacao"
            ].includes(current.id)
        )
    );

}


/* =========================================
   MENU MOBILE
========================================= */

function closeMenu() {

    if (!nav || !menuToggle) {
        return;
    }

    nav.classList.remove("open");

    menuToggle.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "menu-open"
    );

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Abrir menu"
    );

}


function openMenu() {

    if (!nav || !menuToggle) {
        return;
    }

    nav.classList.add("open");

    menuToggle.classList.add(
        "active"
    );

    document.body.classList.add(
        "menu-open"
    );

    menuToggle.setAttribute(
        "aria-expanded",
        "true"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Fechar menu"
    );

}


if (menuToggle && nav) {

    menuToggle.addEventListener(
        "click",
        () => {

            nav.classList.contains(
                "open"
            )
                ? closeMenu()
                : openMenu();

        }
    );

}


navLinks.forEach((link) => {

    link.addEventListener(
        "click",
        closeMenu
    );

});


document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {
            closeMenu();
        }

    }
);


/* =========================================
   REVEAL
========================================= */

function setupReveal() {

    if (
        reduceMotion.matches ||
        !(
            "IntersectionObserver"
            in window
        )
    ) {

        revealElements.forEach(
            (element) =>
                element.classList.add(
                    "revealed"
                )
        );

        return;

    }

    const observer =
        new IntersectionObserver(

            (
                entries,
                currentObserver
            ) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        entry.target.classList.add(
                            "revealed"
                        );

                        currentObserver.unobserve(
                            entry.target
                        );

                    }
                );

            },

            {
                threshold: 0.08,
                rootMargin:
                    "0px 0px -45px 0px"
            }

        );

    revealElements.forEach(
        (element) => {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================
   LUZ QUE SEGUE O MOUSE
========================================= */

function setLocalLight(
    element,
    xVar,
    yVar,
    opacityVar
) {

    if (
        !element ||
        !finePointer.matches ||
        reduceMotion.matches
    ) {
        return;
    }


    const move = (event) => {

        const rect =
            element.getBoundingClientRect();

        element.style.setProperty(
            xVar,
            `${event.clientX - rect.left}px`
        );

        element.style.setProperty(
            yVar,
            `${event.clientY - rect.top}px`
        );

    };


    element.addEventListener(
        "pointerenter",
        (event) => {

            move(event);

            element.style.setProperty(
                opacityVar,
                "1"
            );

        }
    );


    element.addEventListener(
        "pointermove",
        move,
        {
            passive: true
        }
    );


    element.addEventListener(
        "pointerleave",
        () => {

            element.style.setProperty(
                opacityVar,
                "0"
            );

        }
    );

}


function setupLights() {

    setLocalLight(
        header,
        "--header-x",
        "--header-y",
        "--header-opacity"
    );

    setLocalLight(
        footer,
        "--footer-x",
        "--footer-y",
        "--footer-opacity"
    );


    [
        hero,
        document.querySelector(
            ".skills"
        ),
        document.querySelector(
            ".contact"
        )
    ].forEach((section) => {

        setLocalLight(
            section,
            "--fx-x",
            "--fx-y",
            "--fx-opacity"
        );

    });

}


/* =========================================
   CURSOR + RASTRO
========================================= */

function setupCursor() {

    if (
        !finePointer.matches ||
        reduceMotion.matches
    ) {
        return;
    }


    const cursor =
        document.createElement(
            "div"
        );

    cursor.className =
        "fx-cursor";

    document.body.appendChild(
        cursor
    );


    const trail =
        Array.from(
            {
                length: 7
            },
            () => {

                const dot =
                    document.createElement(
                        "div"
                    );

                dot.className =
                    "fx-trail-dot";

                document.body.appendChild(
                    dot
                );

                return {
                    element: dot,
                    x: innerWidth / 2,
                    y: innerHeight / 2
                };

            }
        );


    let targetX =
        innerWidth / 2;

    let targetY =
        innerHeight / 2;

    let cursorX =
        targetX;

    let cursorY =
        targetY;


    document.addEventListener(
        "pointermove",
        (event) => {

            targetX =
                event.clientX;

            targetY =
                event.clientY;

            cursor.classList.add(
                "visible"
            );

        },
        {
            passive: true
        }
    );


    document.documentElement
        .addEventListener(
            "mouseleave",
            () => {

                cursor.classList.remove(
                    "visible"
                );

                trail.forEach(
                    (dot) => {

                        dot.element.style.opacity =
                            "0";

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "a, button, .photo-frame, .skill-card, .project, .education-item, .about-numbers > div"
        )
        .forEach((element) => {

            element.addEventListener(
                "pointerenter",
                () => {

                    cursor.classList.add(
                        "hot"
                    );

                }
            );


            element.addEventListener(
                "pointerleave",
                () => {

                    cursor.classList.remove(
                        "hot"
                    );

                }
            );

        });


    function animate() {

        cursorX =
            lerp(
                cursorX,
                targetX,
                0.24
            );

        cursorY =
            lerp(
                cursorY,
                targetY,
                0.24
            );

        cursor.style.left =
            `${cursorX}px`;

        cursor.style.top =
            `${cursorY}px`;


        let previousX =
            cursorX;

        let previousY =
            cursorY;


        trail.forEach(
            (dot, index) => {

                const speed =
                    0.24 -
                    index * 0.018;

                dot.x =
                    lerp(
                        dot.x,
                        previousX,
                        speed
                    );

                dot.y =
                    lerp(
                        dot.y,
                        previousY,
                        speed
                    );

                dot.element.style.left =
                    `${dot.x}px`;

                dot.element.style.top =
                    `${dot.y}px`;

                dot.element.style.opacity =
                    `${
                        Math.max(
                            0.12,
                            0.68 -
                            index * 0.085
                        )
                    }`;

                previousX =
                    dot.x;

                previousY =
                    dot.y;

            }
        );


        requestAnimationFrame(
            animate
        );

    }


    animate();

}


/* =========================================
   FOTO 3D
========================================= */

function setupPhoto() {

    if (
        !photoFrame ||
        !finePointer.matches ||
        reduceMotion.matches
    ) {
        return;
    }


    photoFrame.addEventListener(
        "pointerenter",
        () => {

            photoFrame.style.setProperty(
                "--photo-light-opacity",
                "1"
            );

        }
    );


    photoFrame.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                photoFrame.getBoundingClientRect();

            const x =
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width;

            const y =
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height;


            photoFrame.style.setProperty(
                "--photo-rx",
                `${
                    clamp(
                        (0.5 - y) * 15,
                        -7.5,
                        7.5
                    )
                }deg`
            );


            photoFrame.style.setProperty(
                "--photo-ry",
                `${
                    clamp(
                        (x - 0.5) * 15,
                        -7.5,
                        7.5
                    )
                }deg`
            );


            photoFrame.style.setProperty(
                "--photo-light-x",
                `${x * 100}%`
            );


            photoFrame.style.setProperty(
                "--photo-light-y",
                `${y * 100}%`
            );

        },
        {
            passive: true
        }
    );


    photoFrame.addEventListener(
        "pointerleave",
        () => {

            photoFrame.style.setProperty(
                "--photo-rx",
                "0deg"
            );

            photoFrame.style.setProperty(
                "--photo-ry",
                "0deg"
            );

            photoFrame.style.setProperty(
                "--photo-light-opacity",
                "0"
            );

        }
    );

}


/* =========================================
   HERO SEGUE O MOUSE
========================================= */

function setupHeroPointer() {

    if (
        !hero ||
        !finePointer.matches ||
        reduceMotion.matches
    ) {
        return;
    }


    hero.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                hero.getBoundingClientRect();

            const x =
                (
                    event.clientX -
                    rect.left
                ) /
                    rect.width -
                0.5;

            const y =
                (
                    event.clientY -
                    rect.top
                ) /
                    rect.height -
                0.5;


            if (heroVisual) {

                heroVisual.style.setProperty(
                    "--visual-x",
                    `${x * 16}px`
                );

                heroVisual.style.setProperty(
                    "--visual-y",
                    `${y * 11}px`
                );

            }


            if (codeCard) {

                codeCard.style.setProperty(
                    "--code-x",
                    `${x * -18}px`
                );

                codeCard.style.setProperty(
                    "--code-y",
                    `${y * -13}px`
                );

            }

        },
        {
            passive: true
        }
    );


    hero.addEventListener(
        "pointerleave",
        () => {

            if (heroVisual) {

                heroVisual.style.setProperty(
                    "--visual-x",
                    "0px"
                );

                heroVisual.style.setProperty(
                    "--visual-y",
                    "0px"
                );

            }


            if (codeCard) {

                codeCard.style.setProperty(
                    "--code-x",
                    "0px"
                );

                codeCard.style.setProperty(
                    "--code-y",
                    "0px"
                );

            }

        }
    );

}


/* =========================================
   3D GERAL
========================================= */

function setup3D(
    elements,
    intensity,
    lift
) {

    if (
        !finePointer.matches ||
        reduceMotion.matches
    ) {
        return;
    }


    elements.forEach(
        (element) => {


            element.addEventListener(
                "pointerenter",
                () => {

                    element.classList.add(
                        "is-3d"
                    );

                    element.style.setProperty(
                        "--lift",
                        `${lift}px`
                    );

                }
            );


            element.addEventListener(
                "pointermove",
                (event) => {

                    const rect =
                        element.getBoundingClientRect();

                    const x =
                        (
                            event.clientX -
                            rect.left
                        ) /
                        rect.width;

                    const y =
                        (
                            event.clientY -
                            rect.top
                        ) /
                        rect.height;


                    element.style.setProperty(
                        "--rx",
                        `${
                            clamp(
                                (0.5 - y) *
                                intensity *
                                2,
                                -intensity,
                                intensity
                            )
                        }deg`
                    );


                    element.style.setProperty(
                        "--ry",
                        `${
                            clamp(
                                (x - 0.5) *
                                intensity *
                                2,
                                -intensity,
                                intensity
                            )
                        }deg`
                    );


                    element.style.setProperty(
                        "--shine-x",
                        `${x * 100}%`
                    );


                    element.style.setProperty(
                        "--shine-y",
                        `${y * 100}%`
                    );

                },
                {
                    passive: true
                }
            );


            element.addEventListener(
                "pointerleave",
                () => {

                    element.classList.remove(
                        "is-3d"
                    );

                    element.style.setProperty(
                        "--rx",
                        "0deg"
                    );

                    element.style.setProperty(
                        "--ry",
                        "0deg"
                    );

                    element.style.setProperty(
                        "--lift",
                        "0px"
                    );

                }
            );

        }
    );

}


/* =========================================
   BOTÕES MAGNÉTICOS
========================================= */

function setupMagneticButtons() {

    if (
        !finePointer.matches ||
        reduceMotion.matches
    ) {
        return;
    }


    document
        .querySelectorAll(
            ".btn, .header-cta"
        )
        .forEach(
            (button) => {


                button.addEventListener(
                    "pointermove",
                    (event) => {

                        const rect =
                            button.getBoundingClientRect();

                        const x =
                            event.clientX -
                            rect.left -
                            rect.width / 2;

                        const y =
                            event.clientY -
                            rect.top -
                            rect.height / 2;


                        button.style.setProperty(
                            "--magnet-x",
                            `${
                                clamp(
                                    x * 0.16,
                                    -10,
                                    10
                                )
                            }px`
                        );


                        button.style.setProperty(
                            "--magnet-y",
                            `${
                                clamp(
                                    y * 0.20,
                                    -8,
                                    8
                                )
                            }px`
                        );

                    },
                    {
                        passive: true
                    }
                );


                button.addEventListener(
                    "pointerleave",
                    () => {

                        button.style.setProperty(
                            "--magnet-x",
                            "0px"
                        );

                        button.style.setProperty(
                            "--magnet-y",
                            "0px"
                        );

                    }
                );

            }
        );

}


/* =========================================
   INDICADOR DE SCROLL
========================================= */

function setupScrollHint() {

    if (
        !hero ||
        document.querySelector(
            ".fx-scroll-hint"
        )
    ) {
        return;
    }


    const hint =
        document.createElement(
            "div"
        );

    hint.className =
        "fx-scroll-hint";

    hint.textContent =
        "Explore";

    hero.appendChild(
        hint
    );

}


/* =========================================
   CONTADORES
========================================= */

function animateCounter(element) {

    const original =
        element.textContent.trim();


    if (
        !/[+%]/.test(original)
    ) {
        return;
    }


    const target =
        Number(
            original.replace(
                /[^0-9.]/g,
                ""
            )
        );


    if (
        !Number.isFinite(target)
    ) {
        return;
    }


    const suffix =
        original.replace(
            /[0-9.]/g,
            ""
        );


    const start =
        performance.now();


    const duration =
        1050;


    function frame(now) {

        const progress =
            clamp(
                (
                    now -
                    start
                ) /
                duration,
                0,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 -
                progress,
                3
            );


        element.textContent =
            `${
                Math.round(
                    target *
                    eased
                )
            }${suffix}`;


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                frame
            );

        } else {

            element.textContent =
                original;

        }

    }


    requestAnimationFrame(
        frame
    );

}


function setupCounters() {

    if (
        reduceMotion.matches ||
        !(
            "IntersectionObserver"
            in window
        )
    ) {
        return;
    }


    const observer =
        new IntersectionObserver(

            (
                entries,
                currentObserver
            ) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        animateCounter(
                            entry.target
                        );

                        currentObserver.unobserve(
                            entry.target
                        );

                    }
                );

            },

            {
                threshold: 0.65
            }

        );


    document
        .querySelectorAll(
            ".about-numbers strong"
        )
        .forEach(
            (counter) => {

                observer.observe(
                    counter
                );

            }
        );

}


/* =========================================
   HERO NO SCROLL
========================================= */

function updateHeroScroll() {

    if (!hero) {
        return;
    }


    if (
        innerWidth <= 820 ||
        reduceMotion.matches
    ) {

        hero.style.setProperty(
            "--hero-word-x",
            "0px"
        );

        hero.style.setProperty(
            "--hero-word-y",
            "0px"
        );


        if (heroContent) {

            heroContent.style.setProperty(
                "--hero-content-x",
                "0px"
            );

            heroContent.style.setProperty(
                "--hero-content-y",
                "0px"
            );

        }

        return;

    }


    const progress =
        clamp(
            window.scrollY /
                Math.max(
                    hero.offsetHeight,
                    1
                ),
            0,
            1
        );


    hero.style.setProperty(
        "--hero-word-x",
        `${progress * 125}px`
    );


    hero.style.setProperty(
        "--hero-word-y",
        `${progress * -25}px`
    );


    if (heroContent) {

        heroContent.style.setProperty(
            "--hero-content-x",
            `${progress * -18}px`
        );

        heroContent.style.setProperty(
            "--hero-content-y",
            `${progress * 24}px`
        );

    }


    if (heroDecoration) {

        heroDecoration.style.setProperty(
            "--decor-y",
            `${progress * 38}px`
        );

    }


    if (heroVisual) {

        heroVisual.style.setProperty(
            "--visual-scroll-y",
            `${progress * -42}px`
        );

    }


    if (codeCard) {

        codeCard.style.setProperty(
            "--code-scroll-y",
            `${progress * 24}px`
        );

    }

}


/* =========================================
   PROFUNDIDADE DURANTE O SCROLL
========================================= */

function updateScrollDepth() {

    if (
        innerWidth <= 820 ||
        reduceMotion.matches
    ) {
        return;
    }


    const center =
        innerHeight / 2;


    const updateGroup =
        (
            elements,
            maxY,
            maxX = 0
        ) => {


            elements.forEach(
                (
                    element,
                    index
                ) => {


                    const rect =
                        element.getBoundingClientRect();


                    if (
                        rect.bottom < -100 ||
                        rect.top >
                            innerHeight + 100
                    ) {
                        return;
                    }


                    const elementCenter =
                        rect.top +
                        rect.height / 2;


                    const distance =
                        clamp(
                            (
                                elementCenter -
                                center
                            ) /
                                center,
                            -1,
                            1
                        );


                    element.style.setProperty(
                        "--scroll-y",
                        `${
                            distance *
                            maxY
                        }px`
                    );


                    if (maxX) {

                        const direction =
                            index % 2 === 0
                                ? 1
                                : -1;


                        element.style.setProperty(
                            "--scroll-x",
                            `${
                                distance *
                                maxX *
                                direction
                            }px`
                        );

                    }

                }
            );

        };


    updateGroup(
        skillCards,
        12,
        5
    );


    updateGroup(
        projects,
        8,
        13
    );


    updateGroup(
        educationItems,
        8,
        4
    );


    headings.forEach(
        (heading) => {


            const rect =
                heading.getBoundingClientRect();


            if (
                rect.bottom < 0 ||
                rect.top >
                    innerHeight
            ) {
                return;
            }


            const elementCenter =
                rect.top +
                rect.height / 2;


            const distance =
                clamp(
                    (
                        elementCenter -
                        center
                    ) /
                        center,
                    -1,
                    1
                );


            heading.style.setProperty(
                "--heading-y",
                `${distance * -10}px`
            );

        }
    );

}


/* =========================================
   LOOP DE SCROLL
========================================= */

function updateScroll() {

    updateProgress();

    updateActiveNav();

    updateHeaderTheme();

    updateHeroScroll();

    updateScrollDepth();

    scrollFrame =
        null;

}


function requestScrollUpdate() {

    if (
        scrollFrame !== null
    ) {
        return;
    }


    scrollFrame =
        requestAnimationFrame(
            updateScroll
        );

}


window.addEventListener(
    "scroll",
    requestScrollUpdate,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    () => {

        if (
            innerWidth > 820 &&
            nav &&
            nav.classList.contains(
                "open"
            )
        ) {
            closeMenu();
        }

        requestScrollUpdate();

    }
);


/* =========================================
   ANO
========================================= */

if (year) {

    year.textContent =
        new Date().getFullYear();

}


/* =========================================
   INICIALIZAÇÃO
========================================= */

setupReveal();

setupLights();

setupCursor();

setupPhoto();

setupHeroPointer();


setup3D(
    skillCards,
    5.5,
    -6
);


setup3D(
    projects,
    3.2,
    -4
);


setup3D(
    educationItems,
    3.8,
    -5
);


setup3D(
    numberCards,
    4,
    -5
);


setup3D(
    contactLinks,
    2,
    -2
);


setupMagneticButtons();

setupScrollHint();

setupCounters();

updateScroll();