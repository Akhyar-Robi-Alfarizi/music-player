const NAV_ITEMS = [
  { key: 'home', label: 'Beranda', icon: 'fas fa-home' },
  { key: 'search', label: 'Cari', icon: 'fas fa-search' },
  { key: 'library', label: 'Koleksi', icon: 'fas fa-book' },
  { key: 'albums', label: 'Album', icon: 'fas fa-compact-disc' },
  { key: 'upload', label: 'Upload Musik', icon: 'fas fa-cloud-upload-alt' },
];

export default function Sidebar({
  view,
  onChangeView,
  user,
  logout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><i className="fas fa-music" /><span>MyMusic</span></div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <a
            href="#"
            key={item.key}
            className={`nav-item ${view === item.key ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              onChangeView(item.key);
            }}
          >
            <i className={item.icon} /><span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-divider" />
      <div className="sidebar-section-title">AKUN</div>
      <div className="playlist-list-sidebar">
        <a href="#" className="playlist-link"><i className="fas fa-user" /><span>{user.username}</span></a>
        <a href="#" className="playlist-link" onClick={(event) => { event.preventDefault(); logout(); }}><i className="fas fa-sign-out-alt" /><span>Logout</span></a>
      </div>
    </aside>
  );
}
