function onPageLoad () {
    if (window.location.search.length > 0) {
        console.log("code exists");
        handleRedirect();
    }
}

async function createPlaylist(data) {
    //make create playlist request first
    let userid = window.localStorage.getItem("userid");
    let username = window.localStorage.getItem("username");
    let endpoint = `https://api.spotify.com/v1/users/${userid}/playlists`;
    let query = "";
    let body = {
        "name": `${username}'s Top 50 songs`,
        "public": 'true',
        "description": `A playlist of ${username}'s top 50 songs of all time.`
    };
    let playlist = await callAPI("POST", endpoint, "", body);

    console.log(playlist);

    //insert items
    console.log(playlist.id);
    console.log(data);
    endpoint = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`;
    query = "";

    let uris = new Array();
    for (let song of data.items) {
        uris.push(song.uri);
        //console.log(song.uri);
    }

    body = {
        "uris": uris
    }

    let snapshot = await callAPI("POST", endpoint, "", body);

    console.log(playlist);
    console.log(snapshot);

    let istream = document.querySelector("#playlist-embed");
    istream.innerHTML = `<iframe src='https://open.spotify.com/embed/playlist/${playlist.id}' id="playlist" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    

}

function renderList(data, type) {

    if (type === "artists") {
        //first
        let pos = document.querySelector("#first > p");
        let img = document.querySelector("#first > img");
        pos.innerHTML = data.items[0].name;
        img.src = data.items[0].images[0].url;
        //second
        pos = document.querySelector("#second > p");
        img = document.querySelector("#second > img");
        pos.innerHTML = data.items[1].name;
        img.src = data.items[1].images[0].url;
        //third
        pos = document.querySelector("#third > p");
        img = document.querySelector("#third > img");
        pos.innerHTML = data.items[2].name;
        img.src = data.items[2].images[0].url;

        let list = document.querySelector("#rest-of-list");
        list.innerHTML = "";
        for (i = 3; i < data.items.length; i++) {
            //console.log(data.items[i].name);
            list.innerHTML += `<li>${data.items[i].name}</li>`
        }
    }
    else if (type === "tracks") {
        //first
        let pos = document.querySelector("#first > p");
        let img = document.querySelector("#first > img");
        pos.innerHTML = data.items[0].name;
        img.src = data.items[0].album.images[0].url;
        //second
        pos = document.querySelector("#second > p");
        img = document.querySelector("#second > img");
        pos.innerHTML = data.items[1].name;
        img.src = data.items[1].album.images[0].url;
        //third
        pos = document.querySelector("#third > p");
        img = document.querySelector("#third > img");
        pos.innerHTML = data.items[2].name;
        img.src = data.items[2].album.images[0].url;

        let list = document.querySelector("#rest-of-list");
        list.innerHTML = "";
        for (i = 3; i < data.items.length; i++) {
            //console.log(data.items[i].name);
            list.innerHTML += `<li>${data.items[i].name}</li>`
        }
    }
}


async function getTop(type, time_range, limit, callback) {
    let topItems;

   
    //var access_token = localStorage.getItem("access_token");
    
    let endpoint = `https://api.spotify.com/v1/me/top/${type}`;
    
    let query = `?time_range=${time_range}&limit=${limit}`;
    
    topItems = await callAPI("GET", endpoint, query);
    console.log(endpoint);

    


    callback(topItems, type);
    console.log("Top 10 " + type + ": ");
    console.log(topItems);

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
    let decadeHead = new Array();
    let frequency = new Array();

    decades.sort(function (a, b) {
        if (a > b) return 1
        else if (a < b) return -1
        else return 0;
    });

    for(let group of decades){
        let key=group;
        let identicalDecades = decades.filter(function(group){
            return key === group;
        });
        //console.log(identicalDecades);

        let index = decades.indexOf(group);
        let howmany = identicalDecades.length;
        decades.splice(index+1,howmany-1);
        decadeHead.push(group);
        frequency.push(identicalDecades.length);
    }

    console.log(decadeHead);
    console.log(frequency);

    //sort decadeHead
    decadeHead.sort(function (a, b) {
        let start = decadeHead.indexOf(a);
        let end = decadeHead.indexOf(b);
        if (frequency[start] > frequency[end]) return 1
        else if (frequency[start] < frequency[end]) return -1
        else return 0
    });
    //sort frequency
    frequency.sort(function (a, b) {
        if (a > b) return 1
        else if (a < b) return -1
        else return 0
    })

    let decadeChart=document.getElementById('decadeChart').getContext('2d');

    let decChart= new Chart(decadeChart,{
        type:'pie',
        data:{
            labels:decadeHead,
            datasets:[{
                label:'Decades',
                data:frequency,
                backgroundColor:[
                    'rgb(255,0,0)',
                    'rgb(0,255,0)',
                    'rgb(0,0,255)',
                    'rgb(255,128,0)',
                    'rgb(127,0,255)',
                    'rgb(255,0,127)',
                    'rgb(0,255,255)',
                    'rgb(255,255,0)',
                    'rgb(0,204,102)'
                ]
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:'Albums Added per Decade',
                    font:{
                        family:"'Open-Sans', sans-serif",
                        size:20
                    },
                    color:'white'
                },
                legend:{
                    display:true,
                    labels:{
                        font:{
                            family:"'Open-Sans', sans-serif",
                            size:15
                        },
                        color:'white'
                    }
                }
            }
        }
            
        
    });
    return decades;
}

async function getMonthsDiscovery(year, callback) {
    let items = await getEntireLibrary('albums', getArtistDiscovery);

    console.log(callback);
    console.log(items);
    return items;
}

function getAlbumDiscovery(data) {
    console.log("Albums: ");
    
    let albums = new Array();
    for (let group of data) {
        for (let item of group.items) {
            //let date = new Date(item.added_at);
            //console.log(date.getMonth());
            let album = {
                name: item.album.name
            };
            let date = new Date(item.added_at);
            album.date_added = date;
            albums.push(album);
        }
    }
    

    albums.sort(function (a, b) {
        if (a.date_added > b.date_added) return 1;
        else if (a.date_added < b.date_added) return -1;
        else return 0;
    });

    let albumsCopy = [...albums];
    console.log(albumsCopy);
    
    var years = new Array();
    let freq= new Array();
    let start = 0;
    for (album of albums) {
        //let date = artist.date_added;
        //let x = date.getFullYear();
        //console.log(artist.date_added.getFullYear());
        let year = {
            year: album.date_added.getFullYear(),
            months: new Array()
        }
        let albumYear = albums.filter(function (album) {
            return album.date_added.getFullYear() === year.year;
        });
        for (i = 0; i < 12; i++) {
            //year.months[i].artists = new Array();
            let albumMonth = albumYear.filter(function (album) {
                return album.date_added.getMonth() === i;
            });
            year.months.push(albumMonth.length);
            freq.push(albumMonth.length);
        }
        
        //console.log(artists.indexOf(artist));
        //console.log(artistsYear.length);
        console.log(year);
        albums.splice(albums.indexOf(album), albumYear.length-1);
        years.push(year);

        //artistsCopy.splice(artistsCopy.indexOf(artist), years.length);
    }


    //console.log(years);
    return years;
}

function getArtistDiscovery(data) {
    //data should be all albums
    
    var artists = new Array();

    for (let group of data){
        for (let item of group.items) {
            let artist = {
                name: item.album.artists[0].name,
                album_name: item.album.name,
            };
            let date = new Date(item.added_at);
            //artist.month = date.getMonth();
            artist.date_added = date;
            //january has a value of zero
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

        //console.log(identicalArtists);
    }

    //at this point, artists is now an array of the first album the user saved from a particular artist
    //each object contains the album, artist and date added

    //now create an array of year objects, each year object has an array of month objects,
    //each month object has a frequency of artists in that month, and an array of artist objects discovered
    
    artists.sort(function (a, b) {
        if (a.date_added > b.date_added) return 1;
        else if (a.date_added < b.date_added) return -1;
        else return 0;
    });

    let artistsCopy = [...artists];
    console.log(artistsCopy);
    
    var years = new Array();
    let freq= new Array();
    let start = 0;
    for (artist of artists) {
        //let date = artist.date_added;
        //let x = date.getFullYear();
        //console.log(artist.date_added.getFullYear());
        let year = {
            year: artist.date_added.getFullYear(),
            months: new Array()
        }
        let artistsYear = artists.filter(function (artist) {
            return artist.date_added.getFullYear() === year.year;
        });
        for (i = 0; i < 12; i++) {
            //year.months[i].artists = new Array();
            let artistsMonth = artistsYear.filter(function (artist) {
                return artist.date_added.getMonth() === i;
            });
            year.months.push(artistsMonth.length);
            freq.push(artistsMonth.length);
        }
        
        //console.log(artists.indexOf(artist));
        //console.log(artistsYear.length);
        console.log(year);
        artists.splice(artists.indexOf(artist), artistsYear.length-1);
        years.push(year);

        //artistsCopy.splice(artistsCopy.indexOf(artist), years.length);
    }
    
    console.log("Artists: ");
    //console.log(artists);

    //console.log(years);
    console.log(freq);
    
    
    //return freq;
    return years;
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
    let genreHead = new Array(); 
    let Freq = new Array();

    for (let genre of genres) {
        let key = genre;
        let identicalGenres = genres.filter(function (genre) {
            return key === genre;
        });

        let index = genres.indexOf(genre);
        let howmany = identicalGenres.length;
        genres.splice(index+1, howmany-1);

        //genreHead.push(genre);
        //Freq.push(identicalGenres.length);
        
        //genres.push(identicalGenres[0]);

        //console.log(identicalGenres);
    }

    
    console.log(allGenres);
    console.log(genres);

    //array of generic genres
    const genreList = [
        "pop",
        "jazz",
        "country",
        "rock",
        "folk",
        "rap",
        "hip hop",
        "reggae",
        "dancehall",
        "brazilian",
        "indie",
        "ambient",
        "r&b", 
        "dance",
        "soul",
        "world",
        "blues",
        "funk",
        "edm",
    ];

    //code to get array of simple genres in library
    let simpleGenres = new Array();
    let other = new Array();

    for (let genre of genreList) {
        let temp = genres.filter(function (a) {
            //return a.includes(genre)
            if (a.includes(genre)) {
                //genres.splice(genres.indexOf(a), 1);
                //console.log(a);
                return true;
            }
            return false;
        })
        Freq.push(temp.length);
        genreHead.push(genre);
        simpleGenres.push(temp);

    }

    //other category
    //genreHead.push("Other");
    //Freq.push(genres.length);

    console.log(simpleGenres);
    console.log(genres);

    console.log(genreFreq);
    console.log(genreHead);
    console.log(Freq);

    //sort genreHead
    genreHead.sort(function (a, b) {
        let start = genreHead.indexOf(a);
        let end = genreHead.indexOf(b);
        if (Freq[start] > Freq[end]) return -1
        else if (Freq[start] < Freq[end]) return 1
        else return 0
    });
    //sort frequency
    Freq.sort(function (a, b) {
        if (a > b) return -1
        else if (a < b) return 1
        else return 0
    })

    let genreChart=document.getElementById('genreChart').getContext('2d');

    let genChart= new Chart(genreChart,{
        type:'pie',
        data:{
            labels:genreHead,
            datasets:[{
                label:'Genre',
                data:Freq,
                backgroundColor:[
                    'rgb(255,0,0)',
                    'rgb(0,255,0)',
                    'rgb(0,0,255)',
                    'rgb(255,128,0)',
                    'rgb(127,0,255)',
                    'rgb(255,0,127)',
                    'rgb(0,255,255)',
                    'rgb(255,255,0)',
                    'rgb(0,204,102)',
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ]
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:'Genres',
                    font:{
                        family:"'Open-Sans', sans-serif",
                        size:20
                    },
                    color:'white'
                },
                legend:{
                    display:false,
                    labels:{
                        font:{
                            family:"'Open-Sans', sans-serif",
                            size:15
                        },
                        color:'white'
                    }
                }
            }
        }
        
            
        
    });
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

    let processedItems = callback(items);

    return processedItems;
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

async function callAPI(method, endpoint, query, body) {
    let response = await fetch (endpoint+query, {
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
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
    window.localStorage.setItem("userid", profile.id);

    //let logout = document.querySelector("#logout");
    //logout.innerHTML += ` (${profile.display_name})`; 
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
