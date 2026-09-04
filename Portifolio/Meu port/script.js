const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

const navLinks = Array.from(
    document.querySelectorAll(".nav a")
);

const sections = Array.from(
    document.querySelectorAll("main section[id]")
);

const revealElements = document.querySelectorAll(".reveal");

const pageProgress =
    document.getElementById("pageProgress");

const year =
    document.getElementById("year");


function updateProgress() {

    const scrollTop =
        window.scrollY;

    const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const progress =
        documentHeight > 0
            ? (scrollTop / documentHeight) * 100
            : 0;

    if (pageProgress) {
        pageProgress.style.width = `${progress}%`;
    }

}


function getSectionAtPosition(position) {

    let currentSection = null;

    sections.forEach((section) => {

        const top =
            section.offsetTop;

        const bottom =
            top + section.offsetHeight;

        if (
            position >= top &&
            position < bottom
        ) {
            currentSection = section;
        }

    });

    return currentSection;

}


function updateActiveNav() {

    const position =
        window.scrollY +
        Math.min(window.innerHeight * 0.35, 250);

    const currentSection =
        getSectionAtPosition(position);

    navLinks.forEach((link) => {
        link.classList.remove("active");
    });

    if (!currentSection) {
        return;
    }

    const activeLink =
        document.querySelector(
            `.nav a[href="#${currentSection.id}"]`
        );

    if (activeLink) {
        activeLink.classList.add("active");
    }

}


function updateHeaderTheme() {

    const position =
        window.scrollY + 40;

    const currentSection =
        getSectionAtPosition(position);

    if (!currentSection) {

        header.classList.remove("light");

        return;

    }

    const lightSections = [
        "sobre",
        "formacao"
    ];

    const isLight =
        lightSections.includes(
            currentSection.id
        );

    header.classList.toggle(
        "light",
        isLight
    );

}


function handleScroll() {

    updateProgress();
    updateActiveNav();
    updateHeaderTheme();

}


function closeMenu() {

    nav.classList.remove("open");

    menuToggle.classList.remove("active");

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

    nav.classList.add("open");

    menuToggle.classList.add("active");

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


menuToggle.addEventListener(
    "click",
    () => {

        const menuIsOpen =
            nav.classList.contains("open");

        if (menuIsOpen) {
            closeMenu();
        } else {
            openMenu();
        }

    }
);


navLinks.forEach((link) => {

    link.addEventListener(
        "click",
        () => {

            navLinks.forEach(
                (item) => {
                    item.classList.remove(
                        "active"
                    );
                }
            );

            link.classList.add("active");

            closeMenu();

        }
    );

});


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            nav.classList.contains("open")
        ) {
            closeMenu();
        }

    }
);


window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 820 &&
            nav.classList.contains("open")
        ) {
            closeMenu();
        }

        handleScroll();

    }
);


window.addEventListener(
    "scroll",
    handleScroll,
    {
        passive: true
    }
);


const revealObserver =
    new IntersectionObserver(

        (entries, observer) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "revealed"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },

        {
            threshold: 0.1,
            rootMargin:
                "0px 0px -50px 0px"
        }

    );


revealElements.forEach(
    (element) => {

        revealObserver.observe(
            element
        );

    }
);


if (year) {

    year.textContent =
        new Date().getFullYear();

}


handleScroll();