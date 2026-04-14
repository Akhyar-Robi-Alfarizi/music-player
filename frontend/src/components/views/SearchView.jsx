import SongList from '../SongList';

export default function SearchView({ search, setSearch, filteredSongs, onPlaySong }) {
  return (
    <section className="view active">
      <div className="view-header">
        <h1>Cari</h1>
        <div className="search-bar">
          <i className="fas fa-search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari lagu, artis, pemilik lagu..." />
        </div>
      </div>
      <SongList songs={filteredSongs} onPlay={(song) => onPlaySong(song, filteredSongs)} />
    </section>
  );
}
