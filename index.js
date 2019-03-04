// fetchPlaylists(data => {
//     // console.log(data);
//     console.log(' - - - Fetched Playlists! - - -')
//     data.items.forEach(p => console.log(p.name));
// })

// fetchTracks(data => {
//     console.log(' - - - Fetched Tracks! - - -')
//     // console.log(data);
//     data.items.map(i => i.track).forEach(t => 
//         console.log(
//             t.name
//             + ' | ' + t.artists.map(a => a.name).join(', ')
//             + ' | ' + t.album.name
//         )
//     )
//     const tracks = data.items.map(i => makeTrack(i.track))
//     console.log(tracks)
// })

function makeTrack(track) {
    return {
        name: track.name,
        artists: track.artists.map(a => a.name),
        album: {
            name: track.album.name,
            href: track.album.href,
        },
    }
}

function fetchPlaylists(onComplete) {
    spotify(`/users/${localStorage.getItem('username')}/playlists`, onComplete)
}

function fetchTracks(onComplete) {
    spotify(`/me/tracks`, onComplete);
}

function spotify(url, onComplete) {
    $.ajax({
        url: `https://api.spotify.com/v1` + url,
        type: 'GET',
        headers: {
            'Authorization' : 'Bearer ' + localStorage.getItem('accessToken'),
        },
        success: onComplete,
        error: (jqXHR, textStatus, errorThrown)=> {
            console.error({jqXHR, textStatus, errorThrown})},
    });
}

getPromise('/me/tracks')
    .done(data => {
        console.log(data);
        const {total} = data;
        console.log(`User has ${total} songs. Here are the first 50 while we fetch the rest: `)
        
        // let tracks = data.items.map(i => makeTrack(i.track));
        // console.log(tracks);

        let offset = tracks.length;
        // while (tracks.length < total) {
        //     getPromise('/me/tracks', offset)
        //         .done(data => {
        //             tracks.concat(data.items.map(i => makeTrack(i.track)));
        //         });
        // }

        promiseSerial(getTrackPromises(total))
            .then(console.log)
            .catch(console.error);
    }).catch(console.error)

function getTrackPromises(total) {
    let offset = 0
    let promises = []
    while (offset < total) {
        promises.push(getPromise('/me/tracks', offset));
        offset += 50;
    }
    return promises;
}

function getPromise(url, offset) {
    return $.ajax({
        url: `https://api.spotify.com/v1` + url + '?limit=50&offset=' + offset,
        type: 'GET',
        headers: {
            'Authorization' : 'Bearer ' + localStorage.getItem('accessToken'),
        },
    });
}

// https://hackernoon.com/functional-javascript-resolving-promises-sequentially-7aac18c4431e
const promiseSerial = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))),
Promise.resolve([]))