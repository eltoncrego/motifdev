function normalizeSpotifyName(name: string) {
    const regex: RegExp = /\s/g;
    return name.replace(regex, "").toLowerCase();
}

export { normalizeSpotifyName }