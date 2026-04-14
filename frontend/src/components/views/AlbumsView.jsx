import { useEffect, useMemo, useState } from 'react';

export default function AlbumsView({
  albums,
  toPublicUrl,
  onCreateAlbum,
  selectedAlbum,
  selectedAlbumSongs,
  loadingAlbumDetail,
  onOpenAlbum,
  onBackToAlbumList,
  onPlaySong,
}) {
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [albumSearch, setAlbumSearch] = useState('');
  const [albumError, setAlbumError] = useState('');
  const [heroGradient, setHeroGradient] = useState('linear-gradient(180deg, rgba(121, 88, 102, 0.55) 0%, rgba(36, 52, 42, 0.4) 38%, #121212 100%)');
  const [albumForm, setAlbumForm] = useState({
    name: '',
    artistName: '',
    description: '',
    cover: null,
  });

  const filteredAlbums = useMemo(() => {
    const keyword = albumSearch.trim().toLowerCase();
    if (!keyword) return albums;

    return albums.filter((album) => {
      const searchable = `${album.name} ${album.artist_name} ${album.owner_username} ${album.description || ''}`.toLowerCase();
      return searchable.includes(keyword);
    });
  }, [albums, albumSearch]);

  const submit = async (event) => {
    event.preventDefault();
    setAlbumError('');
    try {
      await onCreateAlbum(albumForm);
      setAlbumForm({
        name: '',
        artistName: '',
        description: '',
        cover: null,
      });
      setCreatingAlbum(false);
    } catch (error) {
      setAlbumError(error.response?.data?.message || 'Gagal membuat album');
    }
  };

  const formatAlbumDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formatDuration = (value) => {
    const totalSeconds = Number(value);
    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '-:--';

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    let cancelled = false;

    const buildGradientFromCover = async () => {
      if (!selectedAlbum?.cover_url) {
        setHeroGradient('linear-gradient(180deg, rgba(121, 88, 102, 0.55) 0%, rgba(36, 52, 42, 0.4) 38%, #121212 100%)');
        return;
      }

      const imageUrl = toPublicUrl(selectedAlbum.cover_url);
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = imageUrl;

      try {
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;

        const size = 40;
        canvas.width = size;
        canvas.height = size;
        context.drawImage(image, 0, 0, size, size);

        const { data } = context.getImageData(0, 0, size, size);
        let red = 0;
        let green = 0;
        let blue = 0;
        let counted = 0;

        for (let index = 0; index < data.length; index += 4) {
          const alpha = data[index + 3];
          if (alpha < 120) continue;

          red += data[index];
          green += data[index + 1];
          blue += data[index + 2];
          counted += 1;
        }

        if (!counted) return;

        const avgRed = Math.round(red / counted);
        const avgGreen = Math.round(green / counted);
        const avgBlue = Math.round(blue / counted);

        const stronger = `rgba(${avgRed}, ${avgGreen}, ${avgBlue}, 0.65)`;
        const softer = `rgba(${Math.round(avgRed * 0.55)}, ${Math.round(avgGreen * 0.55)}, ${Math.round(avgBlue * 0.55)}, 0.35)`;
        const gradient = `linear-gradient(180deg, ${stronger} 0%, ${softer} 42%, #121212 100%)`;

        if (!cancelled) {
          setHeroGradient(gradient);
        }
      } catch {
        if (!cancelled) {
          setHeroGradient('linear-gradient(180deg, rgba(121, 88, 102, 0.55) 0%, rgba(36, 52, 42, 0.4) 38%, #121212 100%)');
        }
      }
    };

    buildGradientFromCover();

    return () => {
      cancelled = true;
    };
  }, [selectedAlbum, toPublicUrl]);

  return (
    <section className="view active">
      {!selectedAlbum && (
        <div className="view-header view-header-row">
          <h1>Album</h1>
          <button className="btn btn-primary" onClick={() => setCreatingAlbum((value) => !value)}><i className="fas fa-plus" /> Buat Album</button>
        </div>
      )}

      {!selectedAlbum && creatingAlbum && (
        <form className="inline-form" onSubmit={submit}>
          <input placeholder="Nama album" required value={albumForm.name} onChange={(e) => setAlbumForm((state) => ({ ...state, name: e.target.value }))} />
          <input
            required
            placeholder="Nama artis"
            value={albumForm.artistName}
            onChange={(e) => setAlbumForm((state) => ({ ...state, artistName: e.target.value }))}
          />
          <input placeholder="Deskripsi" value={albumForm.description} onChange={(e) => setAlbumForm((state) => ({ ...state, description: e.target.value }))} />
          <input type="file" accept="image/*" onChange={(e) => setAlbumForm((state) => ({ ...state, cover: e.target.files?.[0] || null }))} />
          {albumError ? <p className="auth-error">{albumError}</p> : null}
          <button className="btn btn-accent">Simpan Album</button>
        </form>
      )}

      {!selectedAlbum && (
        <div className="form-group">
          <label>Cari Album</label>
          <input
            placeholder="Cari nama album, artis, atau pemilik album"
            value={albumSearch}
            onChange={(e) => setAlbumSearch(e.target.value)}
          />
        </div>
      )}

      {selectedAlbum ? (
        <div className="album-detail-page">
          <div className="album-detail-hero">
            <div className="album-detail-hero-bg" style={{ background: heroGradient }} />
            <div className="album-detail-hero-content">
              <div className="album-detail-cover">
                {selectedAlbum.cover_url ? (
                  <img src={toPublicUrl(selectedAlbum.cover_url)} alt={selectedAlbum.name} />
                ) : (
                  <div className="album-cover-placeholder large"><i className="fas fa-compact-disc" /></div>
                )}
              </div>
              <div className="album-detail-info">
                <button className="album-detail-back" onClick={onBackToAlbumList}>
                  <i className="fas fa-chevron-left" />
                  Kembali
                </button>
                <span className="album-badge">Playlist Pribadi</span>
                <h1>{selectedAlbum.name}</h1>
                <p className="album-detail-meta">
                  {selectedAlbum.artist_name} • {selectedAlbum.owner_username} • {selectedAlbumSongs.length} lagu
                </p>
              </div>
            </div>
          </div>

          <div className="album-detail-toolbar">
            <div className="album-main-actions">
              <button
                className="btn-play-large"
                onClick={() => selectedAlbumSongs[0] && onPlaySong(selectedAlbumSongs[0], selectedAlbumSongs)}
                disabled={!selectedAlbumSongs.length}
                title="Putar"
              >
                <i className="fas fa-play" />
              </button>
              <button className="album-icon-btn" title="Tambah ke playlist">
                <i className="fas fa-plus" />
              </button>
              <button className="album-icon-btn" title="Unduh">
                <i className="fas fa-arrow-down" />
              </button>
              <button className="album-icon-btn" title="Undang kolaborator">
                <i className="far fa-user" />
              </button>
              <button className="album-icon-btn" title="Lainnya">
                <i className="fas fa-ellipsis-h" />
              </button>
            </div>

            <div className="album-sort-actions">
              <button className="album-icon-btn" title="Cari lagu">
                <i className="fas fa-search" />
              </button>
              <button className="album-sort-btn" title="Urutan lagu">
                Urutan khusus
                <i className="fas fa-chevron-down" />
              </button>
            </div>
          </div>

          {loadingAlbumDetail ? (
            <p className="subtitle">Memuat lagu album...</p>
          ) : (
            <>
              <div className="song-list-header">
                <span>#</span>
                <span>Judul</span>
                <span>Album</span>
                <span>Tanggal ditambahkan</span>
                <span className="header-duration"><i className="far fa-clock" /></span>
              </div>
              <div className="song-list">
                {selectedAlbumSongs.map((song, index) => (
                  <div className="song-item" key={song.id} onClick={() => onPlaySong(song, selectedAlbumSongs)}>
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
                    <div className="song-album-name">{selectedAlbum.name}</div>
                    <div className="song-added-date">{song.created_at ? formatAlbumDate(song.created_at) : '-'}</div>
                    <div className="song-duration">{formatDuration(song.duration ?? song.duration_seconds)}</div>
                  </div>
                ))}
                {!selectedAlbumSongs.length && (
                  <p className="subtitle album-empty-state">Belum ada lagu di album ini.</p>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="album-grid">
          {filteredAlbums.map((album) => (
            <div className="album-card" key={album.id} onClick={() => onOpenAlbum(album.id)}>
              <div className="album-card-cover">
                {album.cover_url ? <img src={toPublicUrl(album.cover_url)} alt={album.name} /> : <div className="album-cover-placeholder"><i className="fas fa-compact-disc" /></div>}
              </div>
              <div className="album-card-info">
                <h3>{album.name}</h3>
                <p>{album.artist_name} • {album.owner_username}</p>
              </div>
            </div>
          ))}
          {!filteredAlbums.length && (
            <p className="subtitle">Album tidak ditemukan.</p>
          )}
        </div>
      )}
    </section>
  );
}
