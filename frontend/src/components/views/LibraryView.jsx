import SongList from '../SongList';

export default function LibraryView({ mySongs, onPlaySong, formatDate }) {
  return (
    <section className="view active">
      <div className="view-header">
        <h1>Koleksi Musikku</h1>
        <p className="subtitle">Ini lagu yang kamu upload sendiri</p>
      </div>
      <SongList
        songs={mySongs}
        onPlay={(song) => onPlaySong(song, mySongs)}
        ownerRenderer={(song) => formatDate(song.created_at)}
      />
    </section>
  );
}
