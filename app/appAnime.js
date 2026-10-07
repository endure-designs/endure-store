// ==========================================================================
// APP ANIME — Galería de anime
// ==========================================================================

function initAnimeGallery() {

    if (typeof renderAnimeGallery === 'function') {
        renderAnimeGallery("anime-gallery", {
            onSelectAnime: (anime) => {

                const prevSubtopic =
                    appState.currentSubtopic;

                if (anime && anime.file_name) {
                    appState.currentSubtopic =
                        anime.file_name;
                } else {
                    appState.currentSubtopic =
                        'all';
                }

                if (
                    prevSubtopic !== appState.currentSubtopic &&
                    appState.currentCollection === 'anime'
                ) {
                    appState.currentPage = 1;
                    catalogUI.renderCurrentProducts();
                }
            }
        });
    }
}

window.appAnime = {
    initAnimeGallery
};
