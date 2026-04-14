import { useEffect, useMemo, useRef, useState } from 'react';
import api from './services/api';
import { useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/layout/Sidebar';
import HomeView from './components/views/HomeView';
import SearchView from './components/views/SearchView';
import LibraryView from './components/views/LibraryView';
import AlbumsView from './components/views/AlbumsView';
import UploadView from './components/views/UploadView';
import PlayerBar from './components/player/PlayerBar';

function toPublicUrl(url) {
  if (!url) return '';
  // Jika sudah URL lengkap (Cloudinary atau URL lain), gunakan langsung
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  // Jika masih path lokal (untuk data lama), tambahkan base URL
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const base = apiBase.replace(/\/api\/?$/, '');
  return `${base}${url}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function App() {
  const { user, authLoading, logout } = useAuth();
  const [view, setView] = useState('home');
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState([]);
  const [loadingAlbumDetail, setLoadingAlbumDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const audioRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');

  const mySongs = useMemo(() => songs.filter((song) => song.owner_id === user?.id), [songs, user]);
  const filteredSongs = useMemo(() => {
    const key = search.trim().toLowerCase();
    if (!key) return songs;
    return songs.filter((song) => (`${song.title} ${song.artist_name} ${song.owner_username}`).toLowerCase().includes(key));
  }, [songs, search]);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const [songRes, albumRes] = await Promise.all([
        api.get('/songs'),
        api.get('/albums'),
      ]);
      setSongs(songRes.data.songs || []);
      setAlbums(albumRes.data.albums || []);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playSong = async (song, list = songs) => {
    if (!song) return;
    const index = list.findIndex((item) => item.id === song.id);
    setQueue(list);
    setQueueIndex(index);
    setCurrentSong(song);

    if (audioRef.current) {
      audioRef.current.src = toPublicUrl(song.file_url);
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = async () => {
    if (!queue.length) return;
    let nextIndex = queueIndex + 1;

    if (shuffleEnabled && queue.length > 1) {
      const candidates = queue
        .map((_, index) => index)
        .filter((index) => index !== queueIndex);
      nextIndex = candidates[Math.floor(Math.random() * candidates.length)];
    } else if (nextIndex >= queue.length) {
      if (repeatMode !== 'all') {
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
        return;
      }
      nextIndex = 0;
    }

    await playSong(queue[nextIndex], queue);
  };

  const playPrev = async () => {
    if (!queue.length) return;
    let prevIndex = queueIndex - 1;

    if (shuffleEnabled && queue.length > 1) {
      const candidates = queue
        .map((_, index) => index)
        .filter((index) => index !== queueIndex);
      prevIndex = candidates[Math.floor(Math.random() * candidates.length)];
    } else if (prevIndex < 0) {
      prevIndex = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    await playSong(queue[prevIndex], queue);
  };

  const toggleShuffle = () => {
    setShuffleEnabled((value) => !value);
  };

  const cycleRepeatMode = () => {
    setRepeatMode((mode) => {
      if (mode === 'off') return 'all';
      if (mode === 'all') return 'one';
      return 'off';
    });
  };

  const onAudioEnded = async () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    await playNext();
  };

  const onCreateAlbum = async (albumForm) => {
    const formData = new FormData();
    formData.append('name', albumForm.name);
    formData.append('artistName', albumForm.artistName);
    formData.append('description', albumForm.description);
    if (albumForm.cover) formData.append('cover', albumForm.cover);

    await api.post('/albums', formData);
    await fetchAllData();
  };

  const onOpenAlbum = async (albumId) => {
    setLoadingAlbumDetail(true);
    try {
      const { data } = await api.get(`/albums/${albumId}`);
      const album = data.album || null;
      const albumSongs = (data.songs || []).map((song) => ({
        ...song,
        artist_name: album?.artist_name || song.artist_name || '-',
        album_name: album?.name || song.album_name || '-',
      }));

      setSelectedAlbum(album);
      setSelectedAlbumSongs(albumSongs);
    } finally {
      setLoadingAlbumDetail(false);
    }
  };

  const onBackToAlbumList = () => {
    setSelectedAlbum(null);
    setSelectedAlbumSongs([]);
  };

  const onUploadSong = async (uploadForm) => {
    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('artistName', uploadForm.artistName);
    if (uploadForm.albumId) formData.append('albumId', uploadForm.albumId);
    formData.append('audio', uploadForm.audio);
    if (uploadForm.cover) formData.append('cover', uploadForm.cover);

    await api.post('/songs', formData);
    await fetchAllData();
    setView('library');
  };

  const onSeek = (event) => {
    if (!audioRef.current || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
  };

  if (authLoading) {
    return <div className="auth-page"><p className="subtitle">Loading...</p></div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <div className="app">
        <Sidebar
          view={view}
          onChangeView={setView}
          user={user}
          logout={logout}
        />

        <main className="main-content">
          {view === 'home' && (
            <HomeView
              songs={songs}
              loadingData={loadingData}
              onPlaySong={playSong}
            />
          )}
          {view === 'search' && (
            <SearchView
              search={search}
              setSearch={setSearch}
              filteredSongs={filteredSongs}
              onPlaySong={playSong}
            />
          )}
          {view === 'library' && (
            <LibraryView
              mySongs={mySongs}
              onPlaySong={playSong}
              formatDate={formatDate}
            />
          )}
          {view === 'albums' && (
            <AlbumsView
              albums={albums}
              toPublicUrl={toPublicUrl}
              onCreateAlbum={onCreateAlbum}
              selectedAlbum={selectedAlbum}
              selectedAlbumSongs={selectedAlbumSongs}
              loadingAlbumDetail={loadingAlbumDetail}
              onOpenAlbum={onOpenAlbum}
              onBackToAlbumList={onBackToAlbumList}
              onPlaySong={playSong}
            />
          )}
          {view === 'upload' && (
            <UploadView
              albums={albums}
              user={user}
              onUploadSong={onUploadSong}
            />
          )}
        </main>

        <PlayerBar
          currentSong={currentSong}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          volume={volume}
          toPublicUrl={toPublicUrl}
          onPrev={playPrev}
          onToggle={togglePlay}
          onNext={playNext}
          shuffleEnabled={shuffleEnabled}
          repeatMode={repeatMode}
          onToggleShuffle={toggleShuffle}
          onCycleRepeatMode={cycleRepeatMode}
          onSeek={onSeek}
          onChangeVolume={setVolume}
        />
      </div>

      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={onAudioEnded}
      />
    </>
  );
}
