import React from "react";
import ReactDOM from "react-dom/client";
import AnimeGallery from "./apps/carousel/AnimeGallery";

window.renderAnimeGallery = function (containerId, options = {}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    ReactDOM.createRoot(container).render(
        <AnimeGallery
            onSelectAnime={options.onSelectAnime}
        />
    );
};