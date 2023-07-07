

/**
 * 
 */
function getPlaylist() {
  return JSON.parse(localStorage.getItem('songPath')) || [];
}

/**
 * 
 */
function addToPlaylist(song) {
  const data = getPlaylist();

  if (data.find(item => item.url === song.url)) {
    return;
  }

  data.push(song);
  
  localStorage.setItem('songPath', JSON.stringify(data));

  renderPlaylist();
}
