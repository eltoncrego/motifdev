const SPOTIFY_CLASSES = {
  // main logo class
  MAIN_LOGO: '.spotify-logo--text',
  // main logo class
  MAIN_HEADER: `header[aria-label='Top bar and user menu'] > div`,
  // main top-level app class
  MAIN_APP_ID: '#main',
  // main track class
  TRACK: '.tracklist-row',
  // column ui class
  TRACK_CONTEXT_WRAPPER: `> .react-contextmenu-wrapper > div[draggable='true']`,
  // column specifically for track name and artist text
  TRACK_TEXT_COLUMN: '.tracklist-col.name',
  // div that holds track's name
  TRACK_TEXT_DIV: '.tracklist-name',
};

export default SPOTIFY_CLASSES;
