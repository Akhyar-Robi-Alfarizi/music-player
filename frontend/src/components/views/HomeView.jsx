import SongList from '../SongList';

export default function HomeView({ songs, loadingData, onPlaySong }) {
  return (
    <section className="view active">
      <div className="view-header">
        <h1>Selamat Datang! 🎶</h1>
        <p className="subtitle">Semua user bisa lihat lagu, kamu bisa upload lagu kamu sendiri</p>
      </div>

      <div className="section">
        <h2 className="section-title">Baru Ditambahkan</h2>
        <SongList
          songs={loadingData ? [] : songs.slice(0, 8)}
          onPlay={(song) => onPlaySong(song, songs)}
        />
      </div>
    </section>
  );
}
