function toPublicUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const base = apiBase.replace(/\/api\/?$/, '');
  return `${base}${url}`;
}

export default function SongList({ songs, onPlay, ownerRenderer }) {
  return (
    <div className="song-list">
      {songs.map((song, index) => (
        <div className="song-item" key={song.id} onClick={() => onPlay(song)}>
          <div className="song-number">{index + 1}</div>
          <div className="song-info">
            <div className="song-thumb">
              {song.cover_url ? (
                <img src={toPublicUrl(song.cover_url)} alt={song.title} />
              ) : (
                <i className="fas fa-music" />
              )}
            </div>
            <div className="song-details">
              <div className="song-title">{song.title}</div>
              <div className="song-artist-name">{song.artist_name}</div>
            </div>
          </div>
          <div className="song-album-name">{song.album_name || '-'}</div>
          <div className="song-duration">{ownerRenderer ? ownerRenderer(song) : song.owner_username}</div>
          <div className="song-actions"><i className="fas fa-play" /></div>
        </div>
      ))}
    </div>
  );
}
