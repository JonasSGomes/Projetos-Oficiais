const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

const navLinks = Array.from(
    document.querySelectorAll(".nav a")
);

const revealElements = document.querySelectorAll(".reveal");

const galleryItems = document.querySelectorAll(".gallery-item");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

const sections = Array.from(
    document.querySelectorAll("main section[id]")
);

const year = document.getElementById("year");


function updateHeader() {
    header.classList.toggle(
        "scrolled",
        window.scrollY > 40
    );
}


function updateActiveNav() {
    const headerHeight = header
        ? header.offsetHeight
        : 0;

    const scrollPosition =
        window.scrollY +
        headerHeight +
        100;

    let currentSection = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;

        if (scrollPosition >= sectionTop) {
            currentSection = section.id;
        }
    });

    const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5;

    if (
        isAtBottom &&
        sections.length > 0
    ) {
        currentSection =
            sections[sections.length - 1].id;
    }

    navLinks.forEach((link) => {
        const href =
            link.getAttribute("href");

        link.classList.toggle(
            "active",
            href === `#${currentSection}`
        );
    });
}


function handleScroll() {
    updateHeader();
    updateActiveNav();
}


handleScroll();


window.addEventListener(
    "scroll",
    handleScroll,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    updateActiveNav
);


menuToggle.addEventListener(
    "click",
    () => {
        const isOpen =
            nav.classList.toggle("open");

        menuToggle.classList.toggle(
            "active",
            isOpen
        );

        header.classList.toggle(
            "menu-active",
            isOpen
        );

        document.body.classList.toggle(
            "menu-open",
            isOpen
        );

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Fechar menu"
                : "Abrir menu"
        );
    }
);


navLinks.forEach((link) => {
    link.addEventListener(
        "click",
        () => {
            navLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            nav.classList.remove("open");

            menuToggle.classList.remove(
                "active"
            );

            header.classList.remove(
                "menu-active"
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
    );
});


const revealObserver =
    new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
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
            });
        },
        {
            threshold: 0.13,
            rootMargin:
                "0px 0px -55px 0px"
        }
    );


revealElements.forEach((element) => {
    revealObserver.observe(element);
});


function openLightbox(imageUrl) {
    if (
        !lightbox ||
        !lightboxImage
    ) {
        return;
    }

    lightboxImage.src = imageUrl;

    lightbox.classList.add("open");

    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "lightbox-open"
    );
}


function closeLightbox() {
    if (
        !lightbox ||
        !lightboxImage
    ) {
        return;
    }

    lightbox.classList.remove("open");

    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "lightbox-open"
    );

    setTimeout(() => {
        lightboxImage.src = "";
    }, 250);
}


galleryItems.forEach((item) => {
    item.addEventListener(
        "click",
        () => {
            openLightbox(
                item.dataset.image
            );
        }
    );
});


if (lightboxClose) {
    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );
}


if (lightbox) {
    lightbox.addEventListener(
        "click",
        (event) => {
            if (
                event.target === lightbox
            ) {
                closeLightbox();
            }
        }
    );
}


document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape"
        ) {
            if (
                lightbox &&
                lightbox.classList.contains(
                    "open"
                )
            ) {
                closeLightbox();
            }

            if (
                nav.classList.contains(
                    "open"
                )
            ) {
                nav.classList.remove(
                    "open"
                );

                menuToggle.classList.remove(
                    "active"
                );

                header.classList.remove(
                    "menu-active"
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
        }
    }
);


if (year) {
    year.textContent =
        new Date().getFullYear();
}


updateActiveNav();