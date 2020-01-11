function normalizeSpotifyName(name: string) {
    const regex: RegExp = /\s/g;
    return name.replace(regex, "").toLowerCase();
}

function formatAsHTMLClass(className: string) {
    return className.replace(/\./g, '');
}

export { normalizeSpotifyName, formatAsHTMLClass }