// ==========================================================================
// CATALOG CARD MODAL ZOOM — Zoom de imagen en el modal de producto
// ==========================================================================

const DESKTOP_ZOOM_SCALE = 3;

let desktopZoomActive = false;

function setupDesktopZoom() {
    const modalImg = document.getElementById('modalImg');
    if (!modalImg) return;

    const container = modalImg.parentElement;
    if (!container) return;

    modalImg.addEventListener('mouseenter', () => {
        if (window.innerWidth <= 768) return;
        desktopZoomActive = true;
        modalImg.classList.add('zoomed');
        modalImg.style.transformOrigin = '0 0';
        modalImg.style.transform = `scale(${DESKTOP_ZOOM_SCALE})`;
    });

    container.addEventListener('mousemove', (e) => {
        if (!desktopZoomActive) return;

        const rect = container.getBoundingClientRect();

        const mouseX = (e.clientX - rect.left) / rect.width;
        const mouseY = (e.clientY - rect.top) / rect.height;

        const maxScrollX = (modalImg.clientWidth * DESKTOP_ZOOM_SCALE) - rect.width;
        const maxScrollY = (modalImg.clientHeight * DESKTOP_ZOOM_SCALE) - rect.height;

        const tx = mouseX * maxScrollX;
        const ty = mouseY * maxScrollY;

        modalImg.style.transform = `scale(${DESKTOP_ZOOM_SCALE}) translate(${-tx / DESKTOP_ZOOM_SCALE}px, ${-ty / DESKTOP_ZOOM_SCALE}px)`;
    });

    modalImg.addEventListener('mouseleave', () => {
        desktopZoomActive = false;
        modalImg.classList.remove('zoomed');
        modalImg.style.transform = 'scale(1) translate(0px, 0px)';
    });
}

window.catalogCardModalZoom = {
    setupDesktopZoom
};
