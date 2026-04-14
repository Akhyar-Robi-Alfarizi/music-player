import { useEffect, useMemo, useState } from 'react';

export default function UploadView({ albums, user, onUploadSong }) {
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artistName: '',
    albumId: '',
    audio: null,
    cover: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [audioMeta, setAudioMeta] = useState({ duration: '', size: '' });

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '-:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes < 0) return '-';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  const coverPreviewUrl = useMemo(() => {
    if (!uploadForm.cover) return '';
    return URL.createObjectURL(uploadForm.cover);
  }, [uploadForm.cover]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  useEffect(() => {
    if (!uploadForm.audio) {
      setAudioMeta({ duration: '', size: '' });
      return;
    }

    const objectUrl = URL.createObjectURL(uploadForm.audio);
    const audioElement = new Audio();
    audioElement.src = objectUrl;

    const handleLoaded = () => {
      setAudioMeta({
        duration: formatDuration(audioElement.duration),
        size: formatFileSize(uploadForm.audio.size),
      });
    };

    const handleError = () => {
      setAudioMeta({
        duration: '-:--',
        size: formatFileSize(uploadForm.audio.size),
      });
    };

    audioElement.addEventListener('loadedmetadata', handleLoaded);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoaded);
      audioElement.removeEventListener('error', handleError);
      URL.revokeObjectURL(objectUrl);
    };
  }, [uploadForm.audio]);

  const submit = async (event) => {
    event.preventDefault();
    if (!uploadForm.audio) return;

    setSubmitError('');
    setSubmitting(true);
    try {
      await onUploadSong(uploadForm);
      setUploadForm({
        title: '',
        artistName: '',
        albumId: '',
        audio: null,
        cover: null,
      });
      setAudioMeta({ duration: '', size: '' });
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Gagal upload lagu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="view active">
      <div className="view-header">
        <h1>Upload Musik</h1>
        <p className="subtitle">Lagu yang kamu upload akan tampil untuk semua user</p>
      </div>
      <form className="upload-form-visible upload-modern" onSubmit={submit}>
        <div className="upload-modern-grid">
          <div className="form-group">
            <label>Judul Lagu</label>
            <input
              required
              placeholder="Contoh: Evaluasi"
              value={uploadForm.title}
              onChange={(e) => setUploadForm((state) => ({ ...state, title: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Artis</label>
            <input
              required
              placeholder="Contoh: Hindia"
              value={uploadForm.artistName}
              onChange={(e) => setUploadForm((state) => ({ ...state, artistName: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Pilih Album (opsional)</label>
          <select value={uploadForm.albumId} onChange={(e) => setUploadForm((state) => ({ ...state, albumId: e.target.value }))}>
            <option value="">-- Tanpa album --</option>
            {albums.filter((album) => album.owner_id === user.id).map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
          </select>
        </div>

        <div className="upload-file-grid">
          <div className="upload-file-card">
            <div className="upload-file-head">
              <div className="upload-file-icon"><i className="fas fa-music" /></div>
              <div>
                <p className="upload-file-title">File Audio</p>
                <p className="upload-file-subtitle">Wajib • MP3/WAV/AIFF dan format audio lain</p>
              </div>
            </div>
            <label className="upload-file-trigger">
              <i className="fas fa-upload" /> Pilih Audio
              <input
                className="upload-file-input"
                type="file"
                accept="audio/*"
                required
                onChange={(e) => setUploadForm((state) => ({ ...state, audio: e.target.files?.[0] || null }))}
              />
            </label>
            <p className="upload-file-name">{uploadForm.audio?.name || 'Belum ada file audio dipilih'}</p>
            {uploadForm.audio ? (
              <div className="upload-audio-meta">
                <span><i className="far fa-clock" /> {audioMeta.duration || 'Membaca durasi...'}</span>
                <span><i className="fas fa-database" /> {audioMeta.size || formatFileSize(uploadForm.audio.size)}</span>
              </div>
            ) : null}
          </div>

          <div className="upload-file-card">
            <div className="upload-file-head">
              <div className="upload-file-icon"><i className="far fa-image" /></div>
              <div>
                <p className="upload-file-title">Gambar Lagu</p>
                <p className="upload-file-subtitle">Opsional • JPG/PNG/WebP</p>
              </div>
            </div>

            {coverPreviewUrl ? (
              <div className="upload-cover-preview-wrap">
                <img className="upload-cover-preview" src={coverPreviewUrl} alt="Preview cover" />
                <button
                  type="button"
                  className="upload-cover-remove"
                  onClick={() => setUploadForm((state) => ({ ...state, cover: null }))}
                >
                  <i className="fas fa-times" /> Hapus gambar
                </button>
              </div>
            ) : null}

            <label className="upload-file-trigger upload-file-trigger-secondary">
              <i className="fas fa-image" /> Pilih Gambar
              <input
                className="upload-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => setUploadForm((state) => ({ ...state, cover: e.target.files?.[0] || null }))}
              />
            </label>
            <p className="upload-file-name">{uploadForm.cover?.name || 'Belum ada gambar dipilih'}</p>
          </div>
        </div>

        {submitError ? <p className="auth-error">{submitError}</p> : null}

        <button className="btn btn-primary" disabled={submitting || !uploadForm.audio}>
          <i className="fas fa-save" /> {submitting ? 'Mengupload...' : 'Simpan'}
        </button>
      </form>
    </section>
  );
}
