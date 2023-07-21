
/**
 * 
 */
function initSongView({ columns }) {

  $(`.song__columns a[data-columns="${columns}"]`).addClass('--active');
  $(`.song__columns a`).on('click', function(e) {
    const columns = $(this).data('columns');

    $(`.song__columns a`).removeClass('--active');

    $(this).addClass('--active');

    $('.song-body').removeClass('--force-columns-1 --force-columns-2 --force-columns-3');
    $('.song-body').addClass(`--force-columns-${columns}`);
  });

  // Set the playlist controls
  const playlist = getPlaylist();

  if (!playlist.length) {
    $('.sound__playlist').addClass('sound__playlist--hide');
    return;
  }

  const index = playlist.findIndex(song => window.location.pathname.toLowerCase() === song.url.toLowerCase());

  // Hide playlist if current song is not in playlist
  if (index === -1) {
    $('.sound__playlist').hide();
    return;
  }

  // Set current song of index in playlist
  $('.sound__playlist span.count').text(`${index + 1} of ${playlist.length}`);

  // Disable prev/next button if current song is first/last song in playlist
  if (index === 0) {
    $('.sound__playlist_prev').addClass('--disabled');
  }
  else {
    $('.sound__playlist_prev').attr('href', playlist[index - 1].url);
  }

  if (index === playlist.length- 1) {
    $('.sound__playlist_next').addClass('--disabled');
  }
  else {
    $('.sound__playlist_next').attr('href', playlist[index + 1].url);
  }
  
}


