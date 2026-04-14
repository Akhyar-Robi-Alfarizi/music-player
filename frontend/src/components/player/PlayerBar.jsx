function formatTime(time) {
  return `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
}

export default function PlayerBar({
  currentSong,
  isPlaying,
  progress,
  duration,
  volume,
  toPublicUrl,
  onPrev,
  onToggle,
  onNext,
  shuffleEnabled,
  repeatMode,
  onToggleShuffle,
  onCycleRepeatMode,
  onSeek,
  onChangeVolume,
}) {
  const repeatActive = repeatMode === 'all' || repeatMode === 'one';

  return (
    <footer className="player-bar">
      <div className="player-left">
        <div className="now-playing-img">
          {currentSong?.cover_url ? <img src={toPublicUrl(currentSong.cover_url)} alt={currentSong.title} /> : <i className="fas fa-music" />}
        </div>
        <div className="now-playing-info">
          <div className="now-playing-title">{currentSong?.title || 'Belum ada lagu'}</div>
          <div className="now-playing-artist">{currentSong?.artist_name || '-'}</div>
        </div>
      </div>
      <div className="player-center">
        <div className="player-controls">
          <button
            className={`player-btn ${shuffleEnabled ? 'active' : ''}`}
            onClick={onToggleShuffle}
            title="Acak lagu"
          >
            <i className="fas fa-random" />
          </button>
          <button className="player-btn" onClick={onPrev}><i className="fas fa-step-backward" /></button>
          <button className="player-btn play-btn" onClick={onToggle}><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} /></button>
          <button className="player-btn" onClick={onNext}><i className="fas fa-step-forward" /></button>
          <button
            className={`player-btn player-repeat-btn ${repeatActive ? 'active' : ''}`}
            onClick={onCycleRepeatMode}
            title={repeatMode === 'off' ? 'Ulangi nonaktif' : repeatMode === 'all' ? 'Ulangi semua lagu' : 'Ulangi satu lagu'}
          >
            <i className="fas fa-redo-alt" />
            {repeatMode === 'one' ? <span className="repeat-one-indicator">1</span> : null}
          </button>
        </div>
        <div className="player-progress">
          <span className="time-current">{formatTime(progress)}</span>
          <div className="progress-bar" onClick={onSeek}>
            <div className="progress-fill" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
          </div>
          <span className="time-total">{formatTime(duration)}</span>
        </div>
      </div>
      <div className="player-right">
        <div className="volume-control">
          <button className="player-btn"><i className="fas fa-volume-up" /></button>
          <input
            className="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onChangeVolume(Number(e.target.value))}
          />
        </div>
      </div>
    </footer>
  );
}
