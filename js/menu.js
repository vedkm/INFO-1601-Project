function onPageLoad () {
    if (window.location.search.length > 0) {
        console.log("code exists");
        handleRedirect();
    }
}



//--------------ALT CODE
/*
async function requestTopArtists () {

    /*
    fetch(endpoint, {
        headers: {
            'Authorization' : 'Bearer ' + access_token
        },
        method: 'GET'
    })
    .then (
        function(response) {
            if (response.status !== 200) {
                console.log ("issue: " + response.status);
                return;
            }

            response.json().then(function(data) {
                console.log(data);
            });
        }
    )
    .catch (function(err) {
        console.log("fetch error: ", err);
    })
    */
    

//}

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
    
    if (type === "genres") {
        limit = 50;
        var access_token = localStorage.getItem("access_token");

        let endpoint = `https://api.spotify.com/v1/me/top/artists`;

        let query = `?time_range=${time_range}&limit=${limit}`;

        topItems = await callAPI("GET", endpoint, query);
        //console.log(topItems);
        console.log(endpoint);
    } else {
        
        var access_token = localStorage.getItem("access_token");
    
        let endpoint = `https://api.spotify.com/v1/me/top/${type}`;
        
        let query = `?time_range=${time_range}&limit=${limit}`;
    
        topItems = await callAPI("GET", endpoint, query);
        console.log(endpoint);
        
    }
    

    callback(topItems, type);
    
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

    console.log(decades);

    return decades;
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
    console.log(dates);
    
    return dates;
}

function getAllGenres (data) {
    //data is an array of all items

    let artists = getAllArtists(data);
    //artists is an array of all artists (artist objects) the user listens to

    let genres = new Array();

    let i = 0;
    for (let artist of artists) {
        genres[i] = artist.genres;
        i++;
    }

    console.log(genres);
}

function getAllArtists (data) {
    let artists = new Array();
    for (let group of data) {
        //console.log(group);
        for (let item of group.items) {
            
            //gets all artists, INCLUDES REPEATS
            let current = item.album.artists[0];
            let found = artists.includes(current.name);
            if (!found) {
                artists.push(current);
                //html += `<p>${item.album.artists[0].name}</p>`;
            }
            
            
        }
    }

    /*
    let endpoint = 'https://api.spotify.com/v1/artists';
    while (offset < total) {

        //first, get an array of the elements in artists between i and i+50
        //consider using .map
        
        let query = `?ids=`;
        let temp = await callAPI("GET", endpoint, query);
        
        //console.log(temp);

        offset += 50;
    }
    */

    console.log(artists);
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
    console.log(`At Call API: ` + response.status);

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


    /*
    fetch (token, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 
            'Authorization': 'Basic ' + btoa(client_id + ":" + client_secret)
        },
        method: 'POST',
        body: body
        
    })
    .then (function (response) {
        if (response.status === 200) {
            var data = JSON.parse(response.responseText);
            console.log(data);
            var data = JSON.parse(response.responseText);
            if (data.access_token != undefined) {
                access_token = data.access_token;
                localStorage.setItem("access_token", access_token);
            }
            if (data.refresh_token != undefined) {
                refresh_token = data.refresh_token;
                localStorage.setItem("refresh_token", refresh_token);
            }
            onPageLoad();
        }
        else if (response.status === 401) {
            refreshAccessToken ();
        }
        else {
            console.log(response.responseText);
            alert(response.responseText);
        }
    })
    */

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
        onPageLoad();
    }
    else if (this.status === 401) {
        console.log('At handleAuthResponse: ' + this.status);
        refreshAccessToken();
    }
    else {
        console.log('At handleAuthResponse: ' + this.responseText);
        alert(this.responseText);
    }
}

function refreshAccessToken() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;

    callAuthApi(body);
}

function getCode() {
    let code = null;
    const qString = window.location.search;
    if (qString.length > 0) {
        const urlParams = new URLSearchParams(qString);
        code = urlParams.get('code');
    }

    //console.log("code");
    return code;
}