
/**
 * 
 */
function initSongView() {
  const playlist = getPlaylist();

  if (!playlist.length) {
    $('.sound__playlist').addClass('sound__playlist--hide');
    return;
  }

  const index = playlist.findIndex(song => window.location.pathname.toLowerCase() === song.url.toLowerCase());
  
  $('.sound__playlist span.count').text(`${index + 1} of ${playlist.length}`);

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


