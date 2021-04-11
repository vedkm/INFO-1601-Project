const client_id = "9a0a70b3ee894325b5e22053070e25c9";
const client_secret = "5f2e8eb22cc64b39b248a92162cd3dc5";
//const redirect_uri = "http://127.0.0.1:5500/html/menu.html";
const redirect_uri = "https://spotstats-c95dd.web.app/html/menu.html";
const scopes = "user-read-private user-library-read user-top-read playlist-modify-private playlist-modify-public";

localStorage.setItem("client_id", client_id);
localStorage.setItem("client_secret", client_secret);
localStorage.setItem("redirect_uri", redirect_uri);

const AUTHORIZATION_URL = "https://accounts.spotify.com/authorize";


function authUser () {
    let url = AUTHORIZATION_URL + "?";
    url += `client_id=${client_id}`;
    url += `&response_type=code`;
    url += `&redirect_uri=${redirect_uri}`;
    url += `&scope=${scopes}`;
    url += `&show_dialog=true`;

    window.location.href = url;
}