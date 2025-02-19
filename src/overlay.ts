/** Overlay */

const overlay = document.getElementById("overlay") as HTMLElement;
let error = false;

export function initOverlay() {
    if (window.innerWidth < 960 || window.innerHeight < 320) {
        overlay.classList.remove("hidden");
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth < 960 || window.innerHeight < 320) {
            overlay.classList.remove("hidden");
        } else if (!error) {
            overlay.classList.add("hidden");
        }
    });
}

export function overlayServerError() {
    const errorHeader = overlay.querySelector("h1") as HTMLElement;
    const errorText = overlay.querySelector("p") as HTMLElement;

    errorHeader.innerText = "Server Error!";
    errorText.innerText = ` An error occurred while connecting to the backend server! Is the server alive?
Try refreshing the page! If the problem persists, contact: \n\nmoonawardev@gmail.com`;

    overlay.classList.remove("hidden");

    error = true;
}