$(async function() { 
    await changeSpotify();
});

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, 3000));
}

async function changeSpotify() {
    // Need to wait for spotifies dom structure to load... happens through react so it
    // may not available when this script gets originally run on the document.ready
    // event... we can probably do a better check by doing shorter polls
    // and retrying every 500 ms or something like that until we find
    // some element we are looking for that is guaranteed to be there eventually
    sleep(3000).then(r => $(".tracklist").children().append("<p>hey ;)</p>"));
}
