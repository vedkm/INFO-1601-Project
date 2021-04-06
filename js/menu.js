function onPageLoad () {
    if (window.location.search.length > 0) {
        console.log("code exists");
        handleRedirect();
    }

    getUsername();
}




function renderList(data, type) {
    let html = "<ol>";
    for (item of data.items) {
        if (type === "artists") {
            html += `<li>${item.name}</li>`
            let imageArraySize = item.images.length;
            //images array contains multiple images of different sizes, with the largest in the 0 position
            //so, the smallest would be the last (array size - 1)
            //also, the images[] object has width and height values which can be accessed by:
            //item.images[x].width
            html += `<img src=${item.images[imageArraySize-1].url}>`;
        }
        if (type === "tracks") {
            html += `<li>${item.name}</li>`; 
            //tracks do not have images, but they belong to an album object which has an images array
            //console.log(item);
            let imageArraySize = item.album.images.length;
            html += `<img src=${item.album.images[imageArraySize-2].url}>`;
        }
        if (type === "genres") {
            console.log(item.genres);
            html += `<li>${item.genres}</li>`;
        }
        //console.log(item.images);
        //console.log(item.name);
    }
    html += "</ol>";

    document.querySelector("#top-"+type).innerHTML = html;

}


async function getTop(type, time_range, callback) {
    var limit = 10;
    let topItems;

   
    var access_token = localStorage.getItem("access_token");
    
    let endpoint = `https://api.spotify.com/v1/me/top/${type}`;
    
    let query = `?time_range=${time_range}&limit=${limit}`;
    
    topItems = await callAPI("GET", endpoint, query);
    console.log(endpoint);

    


    //callback(topItems, type);
    console.log("Top 10 " + type + ": ");
    console.log(topItems);

}

function getArtistImage(id) {
    
}

function getImages(data) {
    let images = {
        artists: new Array(),
        albums: new Array()
    }

    for (let group of data) {
        for (let item of group.items) {
            images.albums.push(item.album.images[0]);
            images.artists.push(item.album)
        }
    }

    //returns an object containing an array of artist images and album images
}

function getDecades(data) {
    let dates = getReleaseDates(data);

    let decades = new Array();

    for (let date of dates) {
        //console.log(group);
        let year = date.slice(0, 4);
        let decade = Math.floor(year/10) * 10;
        decades.push(decade);
        //console.log(item.album.release_date);
    }

    console.log("Decades: ");
    console.log(decades);

    return decades;
}

async function getMonthsDiscovery(year, callback) {
    let items = await getEntireLibrary('albums', callback);

    //console.log("items");
    //console.log(items);
    return items;
}

function getAlbumDiscovery(data) {
    console.log("Albums: ");
    
    let albums = new Array();
    for (let group of data) {
        for (let item of group.items) {
            //let date = new Date(item.added_at);
            //console.log(date.getMonth());
            albums.push(item);
        }
    }
    
    console.log(albums);
    return albums;
}

function getArtistDiscovery(data) {
    //data should be all albums
    
    var artists = new Array();

    for (let group of data){
        for (let item of group.items) {
            let artist = {
                name: item.album.artists[0].name,
                album_name: item.album.name,
                date_added: item.added_at
            };
            artists.push(artist);
            //console.log(date);
        }
    }

    //next, repeatedly make a new array containing only albums by a single artist
    //then find the instance with earliest date and push it into an array

    //sort alphabetically
    artists.sort(function (a, b) {
        if (a.name > b.name) return 1
        else 
        if (a.name < b.name) return -1
        else return 0;
    });
    
    for (let artist of artists) {
        let name = artist.name;
        let identicalArtists = artists.filter(function (artist) {
            return name === artist.name;
        });
        //now sort identicalArtists by date
        identicalArtists.sort(function (a,b) {
            if (a.date_added > b.date_added) return 1
            else 
            if (a.date_added < b.date_added) return -1
            else return 0;
        });
        

        let index = artists.indexOf(artist);
        let howmany = identicalArtists.length;
        artists.splice(index+1, howmany-1);
        artists.splice(index, 1, identicalArtists[0]);

        console.log(identicalArtists);
    }

    //at this point, artists is now an array of the first album the user saved from a particular artist
    //each object contains the album, artist and date added
    console.log("Artists: ");
    console.log(artists);
    return artists;
}

function getDatesAdded (data) {

    let dates = new Array();

    for (let group of data){

        for (let item of group.items) {
            let date = item.added_at;
            dates.push(date);
            //console.log(date);
        }
    }

    //dates is an array of date objects
    //each date is the date an album was added
    
    console.log(dates);

    return dates;
}

function getReleaseDates (data) {

    //dateType is either "release" or "added"

    let dates = new Array();

    for (let group of data) {
        //console.log(group);
        for (let item of group.items) {
            let date = item.album.release_date;
            dates.push(date);
            //console.log(item.album.release_date);
        }
    }
    console.log("Release Dates: ");
    console.log(dates);
    
    return dates;
}

async function getGenre(id) {
    let endpoint = "https://api.spotify.com/v1/artists/" + id;
    let artist = await callAPI("GET", endpoint, "");

    let genre = artist.genres;

    return genre;
}

async function getAllGenres (data) {
    //data is an array of all albums
    let artists = getAllArtists(data);

    let allGenres = new Array();

    for (let artist of artists) {
        let artistGenres = await getGenre(artist.id);
        for (let genre of artistGenres) {
            allGenres.push(genre);
        }
        //console.log(genre);
    }

    allGenres.sort();

    //get an array of all unique genres
    let genres = allGenres.filter(function (genre) {
        return genre;
    });

    let genreFreq = new Array();

    for (let genre of genres) {
        let key = genre;
        let identicalGenres = genres.filter(function (genre) {
            return key === genre;
        });

        let index = genres.indexOf(genre);
        let howmany = identicalGenres.length;
        genres.splice(index+1, howmany-1);

        let obj = {
            name: genre,
            frequency: identicalGenres.length
        }
        genreFreq.push(obj);
        //genres.push(identicalGenres[0]);

        //console.log(identicalGenres);
    }

    
    console.log(allGenres);
    console.log(genres);
    genreFreq.sort(function (a, b) {
        if (a.frequency < b.frequency) {
            return 1;
        }
        else if (a.frequency > b.frequency) {
            return -1;
        }
        else return 0;
    })
    console.log(genreFreq);
}

function getAllArtists (data) {

    let artists = new Array();

    for (let group of data) {
        for (let item of group.items) {
            //console.log(item.album.artists[0]);
            artists.push(item.album.artists[0]);
        }
    }

    
    //sort alphabetically
    artists.sort(function (a, b) {
        if (a.name > b.name) return 1
        else 
        if (a.name < b.name) return -1
        else return 0;
    });
    
    //handle duplicates
    for (let artist of artists) {
        let name = artist.name;
        let identicalArtists = artists.filter(function (artist) {
            return name === artist.name;
        });

        let index = artists.indexOf(artist);
        let howmany = identicalArtists.length;
        artists.splice(index+1, howmany-1);
        artists.splice(index, 1, identicalArtists[0]);

        //console.log(identicalArtists);
    }

    return artists;
}

//implement functionality to get all artists
async function getEntireLibrary (type, callback) {
    //type can be either albums or tracks
    
    let total = await getNumItems(type);
    console.log(total);

    //it is impossible to get all albums in a single request (max is 50 per)
    //so, increment by 50 until total is reached

    let offset = 0;
    let endpoint = 'https://api.spotify.com/v1/me/' + type;
    
    
    let items = [];
    while (offset < total) {
        let query = `?limit=50&offset=${offset}`;
        let temp = await callAPI("GET", endpoint, query);
        
        items = items.concat(temp);
        
        //console.log(temp);

        offset += 50;
    }
    
    
    //use next value
    /*
    let query = `?limit=50&offset=${offset}`;
    let items = await callAPI ("GET", endpoint, query);
    console.log(items);
    while (items.next != null) {
        let url = new URL(items.next);
        query = "?" + new URLSearchParams(url.search); 
        
        temp = await callAPI ("GET", endpoint, query);
        console.log(temp);

        items = items.concat(temp);
        //console.log(items);
    }
    */
    
    console.log(items);

    callback(items);

    return items;
    //items is an array of all tracks/albums (grouped by 50 or less)
    //each index in items array contains 50 or less items
    
}

async function getNumItems(type) {
    let endpoint = 'https://api.spotify.com/v1/me/' + type;
    let query =  `?limit=1`;
    let item = await callAPI("GET", endpoint, query);
    console.log(item);

    return item.total;
}

access_token = localStorage.getItem("access_token");

function refreshAccessToken () {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    
    callAuthApi(body);
}

async function callAPI(method, endpoint, query) {
    let response = await fetch (endpoint+query, {
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        method: method
    })
    .catch (function (error) {
        console.log("Fetch Error: " + error);
    })
    let data = await response.json();
    console.log(`At CallAPI: ${endpoint}: ` + response.status);
    if (response.status === 401) {
        refreshAccessToken();
    }

    return data;
}

function handleRedirect() {
    let code = getCode();
    console.log(code);

    fetchAccessToken(code);

    window.history.pushState("", "", redirect_uri);
}

const client_id = localStorage.getItem("client_id");
const client_secret = localStorage.getItem("client_secret");
const redirect_uri = localStorage.getItem("redirect_uri");
//const scopes = "user-read-private user-library-read user-top-read playlist-modify-private playlist-modify-public";

function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    
    callAuthApi(body);
}

const token = "https://accounts.spotify.com/api/token";

function callAuthApi(body) {
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", token, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthResponse;
    
}

function handleAuthResponse() {
    if (this.status === 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        //onPageLoad();
        getUsername();
    }
    else if (this.status === 401) {
        console.log('At handleAuthResponse: ' + this.status);
        refreshAccessToken();
    }
    else if (this.status === 400) {
        window.location.href = "/index.html";
    }
    else {
        console.log('At handleAuthResponse: ' + this.responseText);
        //alert(this.responseText);
    }
}

async function getUsername() {
    let endpoint = "https://api.spotify.com/v1/me";
    let profile = await callAPI("GET", endpoint, "");

    console.log(profile);
    window.localStorage.setItem("username", profile.display_name);

    let logout = document.querySelector("#logout");
    logout.innerHTML += ` (${profile.display_name})`; 
    //<img src="${profile.images[0].url}" style="height:25% width:25%">`;

    //return profile.display_name;
}

function getCode () {
    let code = null;
    const qString = window.location.search;
    if (qString.length > 0) {
        const urlParams = new URLSearchParams (qString);
        code = urlParams.get('code');
    }

    //console.log("code");
    return code;
}


// HAMBURGER CODE
console.log(window.navigator.cookieEnabled);
console.log(window.navigator.online);
console.log(navigator.appVersion);
console.log(navigator.userAgent)
console.log(navigator.platform);


console.log(window.location.href);
console.log(window.location.protocol);
console.log(window.location.hostname);


function redirect(url){
  window.location.assign(url);
}
/*
window.onload = function(event){
   console.log("Page has loaded");

}
*/
const sidebar = document.querySelector('.sidebar');
const navLinks = document.querySelector('.nav-links');
const Links = document.querySelector('.nav-links li');

sidebar.addEventListener('click', ()=> {
  navLinks.classList.toggle('open');
});
