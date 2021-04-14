const client_id = "9a0a70b3ee894325b5e22053070e25c9";
const client_secret = "5f2e8eb22cc64b39b248a92162cd3dc5";
const redirect_uri = "http://127.0.0.1:5500/html/menu.html";
const scopes = "user-read-private user-library-read user-top-read playlist-modify-private playlist-modify-public";

localStorage.setItem("client_id", client_id);
localStorage.setItem("redirect_uri", redirect_uri);

const AUTHORIZATION_URL = "https://accounts.spotify.com/authorize";



function getCodeVerifier() {

    
    let length = Math.floor((Math.random() + 0.43)*128);
    //console.log(length);
    let string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";

    let verifier = new Array;
    for (let i = 0; i< length; i++) {
        verifier.push(string.charAt(Math.floor(Math.random() * length)))
    }

    verifier = verifier.join('');
    console.log(verifier);
    return verifier;

}

function sha256(plain) { 
    // returns promise ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a) {
    // Convert the ArrayBuffer to string using Uint8 array.
    // btoa takes chars from 0-255 and base64 encodes.
    // Then convert the base64 encoded to base64url encoded.
    // (replace + with -, replace / with _, trim trailing =)
    return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function pkce_challenge_from_verifier(v) {
    hashed = await sha256(v);
    base64encoded = base64urlencode(hashed);
    return base64encoded;
}

async function authUser() {
    let verifier = getCodeVerifier();
    //let verifier = "pPxv5vD~R1cYrVY1N3tFxcrLu8PIah~hYLpU.o9aHzsA2w~hdMGZJIoM3ruGGqeoKqrfvGcU4VDx3pU9sGNSoJKI4BJhvmFQSAUAOQe_r83sy-4QNnKwgCD6-pca783U"
    //alert(verifier);
    let code_challenge = await pkce_challenge_from_verifier(verifier);
    window.localStorage.setItem("verifier", verifier);
    window.localStorage.setItem("code_challenge", code_challenge);


    let url = AUTHORIZATION_URL + "?";
    url += `client_id=${client_id}`;
    url += `&response_type=code`;
    url += `&redirect_uri=${redirect_uri}`;
    url += `&code_challenge_method=S256`;
    url += `&code_challenge=${code_challenge}`;
    url += `&scope=${scopes}`;
    url += `&show_dialog=true`;

    window.location.href = url;
}