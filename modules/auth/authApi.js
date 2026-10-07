async function getCurrentUser() {

    const response = await fetch(`${CONFIG.API_BASE_URL}/me`, {
        method: "GET",
        credentials: "include"
    });

    return response;
}


async function loginWithGoogle(credential) {

    const response = await fetch(`${CONFIG.API_BASE_URL}/google`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            credential
        })
    });

    return response;
}


window.authApi = {
    getCurrentUser,
    loginWithGoogle
};