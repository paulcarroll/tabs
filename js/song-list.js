
/**
 * 
 */
function renderPlaylist() {
  const songs = getPlaylist();
  const $list = $('.homepage-playlist ul');

  $list.empty();

  songs.map(song => {
    const li = $('<li/>')
      .attr('role', 'menuitem')
      .appendTo($list);

    const link = $('<a/>')
      .attr('href', song.url)
      .text(song.title)
      .appendTo(li);

    const remove = $('<a/>')
      .attr('href', '#')
      .html('<i class="fa fa-remove"></i>')
      .appendTo(link)
      .click(e => {
        const songs = getPlaylist().filter(item => item.url !== song.url);
        
        localStorage.setItem('songPath', JSON.stringify(songs));

        renderPlaylist();
      });

      $list.append(li);
  });
}

/**
 * 
 */
function initPlaylist() {
  $('.homepage-playlist a.clear').on('click', e => {
    e.preventDefault();

    localStorage.removeItem('songPath');

    renderPlaylist();
  });

  $('.homepage-playlist a.play').on('click', e => {
    const songs = getPlaylist();
    if (!songs.length) {
      return;
    }

    window.location.href = songs[0].url;
  });

  renderPlaylist();
}

/**
 * 
 */
function initSongList() {
  const table = $('.homepage-songs table').DataTable({
    ajax: './data.json',
    dom: '<"dtsp-dataTable"frtip>',
    responsive: {
      details: {
        type: 'none'
      }
    },
    paging: false,
    searchPanes: {
      layout: 'columns-1',
      controls: false				
    },
    order: [1, "asc"],
    buttons: {
      buttons: [
        {
            text: 'Alert',
            action: function ( e, dt, node, config ) {
                alert( 'Activated!' );
                this.disable(); // disable button
            }
        }
      ]
    },
    columns: [
      {
        data: "group",
        responsivePriority: 2,
        className: 'all',
        targets: [0] 
      }, {
        data: "title",
        responsivePriority: 1,
        className: 'all',
        targets: [1],
        render: (data, type, row) => `<a href="${row.url}">${row.title}</a>`
      }, {
        data: "tags",
        responsivePriority: 10, 
        targets: [2],
        searchPanes: {
          orthogonal: 'sp',
          combiner: 'and'
        }
      }, {
        data: "capo",
        responsivePriority: 100, 
        targets: [3]
      }, {
        data: "tuning",
        responsivePriority: 100, 
        targets: [4]
      }, {
        data: null,
        responsivePriority: 1,
        className: 'all', 
        defaultContent: '<a href="#" class="fa-solid fa-plus" title="Add to playlist"></a>',
        targets: [-1]
      }
    ]
  });
  
  table.searchPanes();
  table.on('click', 'a.fa-solid', (e) => {
    const song = table.row(e.target.closest('tr')).data();

    addToPlaylist(song)
  });

  $(".homepage .homepage-search").append(table.searchPanes.container());
}
