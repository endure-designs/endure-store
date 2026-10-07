// ==========================================================================
// APP CHECKOUT — Pedido por WhatsApp
// ==========================================================================

function sendOrderToWhatsApp() {
    if (typeof getCart !== 'function') {
        console.error('getCart is not defined. Make sure cart modules are loaded.');
        return;
    }

    const cart = getCart();
    if (!cart || cart.length === 0) return;

    let subtotal = 0;
    let productsText = "";

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        const colorText = item.color ? `, Color: ${item.color}` : '';
        productsText += `- *${item.name}* (Talla: ${item.size}${colorText}) x${item.qty} -> S/${itemTotal.toFixed(2)}\n`;
    });

    const totalText = `S/${subtotal.toFixed(2)}`;

    const message = `⚡ *NUEVO PEDIDO - ENDURE*\n\n` +
        `Hola, me gustaría concretar la compra de los siguientes productos:\n\n` +
        `${productsText}\n` +
        `*Subtotal del Pedido:* ${totalText}\n\n` +
        `_Quedo a la espera para coordinar el método de pago y el envío. ¡Gracias!_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${appState.WHATSAPP_PHONE}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}

window.appCheckout = {
    sendOrderToWhatsApp
};
