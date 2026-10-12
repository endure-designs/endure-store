
(() => {
    function initContacto() {
        const widget = document.getElementById('whatsappWidget');
        const bubble = document.getElementById('whatsappBubble');
        const closeButton = document.getElementById('whatsappBubbleClose');
        const whatsappButton = document.getElementById('whatsappFloatButton');
        const bubbleLink = document.getElementById('whatsappBubbleLink');

        if (
            !widget ||
            !bubble ||
            !closeButton ||
            !whatsappButton ||
            !bubbleLink
        ) {
            return;
        }

        const WHATSAPP_NUMBER = '51996440579';

        const MESSAGE =
            'Hola, Endure. Tengo una idea para un diseño personalizado.';

        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

        whatsappButton.href = whatsappURL;
        bubbleLink.href = whatsappURL;

        const INTERVAL_MS = 60_000;
        let timerId = null;
        let dismissed = false;

        function showBubble() {
            if (dismissed) return;
            bubble.classList.add('is-visible');
        }

        function hideBubble() {
            bubble.classList.remove('is-visible');
        }

        function scheduleBubble() {
            if (dismissed || timerId !== null) return;

            timerId = window.setTimeout(() => {
                timerId = null;
                showBubble();
            }, INTERVAL_MS);
        }

        closeButton.addEventListener('click', () => {
            dismissed = true;
            hideBubble();

            if (timerId !== null) {
                window.clearTimeout(timerId);
                timerId = null;
            }
        });

        whatsappButton.addEventListener('click', hideBubble);
        bubbleLink.addEventListener('click', hideBubble);

        scheduleBubble();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContacto, {
            once: true
        });
    } else {
        initContacto();
    }
})();
