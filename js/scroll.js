window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 380) {
        navbar.classList.add("navbar_shadow_class")
    } else {
        navbar.classList.remove("navbar_shadow_class")
    }
})