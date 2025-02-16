/** Overlay */
export function initOverlay() {
    const overlay = document.getElementById("overlay") as HTMLElement;
    if (window.innerWidth < 960 || window.innerHeight < 320) {
        overlay.classList.remove("hidden");
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth < 960 || window.innerHeight < 320) {
            overlay.classList.remove("hidden");
        } else {
            overlay.classList.add("hidden");
        }
    });
}