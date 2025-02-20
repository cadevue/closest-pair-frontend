/** Overlay */

const overlay = document.getElementById("overlay") as HTMLElement;
let error = false;

export function initOverlay() {
    if (window.innerWidth < 960 || window.innerHeight < 320) {
        if (error) return;
        setAndShowOverlay(
            "Screen size does not suffice!",
            "Please use a larger screen to view this page. Maybe Ctrl+Scroll to zoom out?"
        )
    }

    window.addEventListener('resize', () => {
        if (error) return;
        if (window.innerWidth < 960 || window.innerHeight < 320) {
            setAndShowOverlay(
                "Screen size does not suffice!",
                "Please use a larger screen to view this page. Maybe Ctrl+Scroll to zoom out?"
            )
        } else {
            hideOverlay();
        }
    });
}

export function setOverlay(header : string, text : string, isError = false) {
    const errorHeader = overlay.querySelector("h1") as HTMLElement;
    const errorText = overlay.querySelector("p") as HTMLElement;

    error = isError;

    errorHeader.innerText = header;
    errorText.innerText = text;
}

export function setAndShowOverlay(header : string, text : string, isError = false) {
    setOverlay(header, text, isError);
    showOverlay();
}

export function showOverlay() {
    overlay.classList.remove("hidden");
}

export function hideOverlay() {
    overlay.classList.add("hidden");
}