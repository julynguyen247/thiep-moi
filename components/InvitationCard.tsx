'use client';

import { useEffect, useState } from 'react';

interface InfoItem {
  icon: string;
  label: string;
  value: string;
  address?: string;
  mapQuery?: string;
}

const infoItems: InfoItem[] = [
  { 
    icon: '🍗', 
    label: 'Ăn uống', 
    value: 'Jollibee Vincom Đà Nẵng',
    address: '910A Ng. Quyền, An Hải',
    mapQuery: 'Jollibee Vincom Đà Nẵng, 910A Ng. Quyền, An Hải, Đà Nẵng 550000, Vietnam'
  },
  { 
    icon: '☕', 
    label: 'Cà phê', 
    value: 'La Hygge',
    address: '273 Chính Hữu, An Hải',
    mapQuery: 'La Hygge, 273 Chính Hữu, An Hải, Đà Nẵng 550000, Vietnam'
  },
];

const floatingEmojis = ['+', '*', '✧', '∘', '·', '×'];

export default function InvitationCard() {
  const [visible, setVisible] = useState(false);
  const [confettiEmojis, setConfettiEmojis] = useState<
    { emoji: string; x: number; y: number; delay: number; duration: number; size: number }[]
  >([]);

  useEffect(() => {
    // Generate floating emoji decorations
    const emojis = Array.from({ length: 12 }, (_, i) => ({
      emoji: floatingEmojis[i % floatingEmojis.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 0.8 + Math.random() * 0.8,
    }));
    setConfettiEmojis(emojis);

    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="invitation-outer">
      {/* Floating emoji decorations around the card */}
      <div className="floating-emojis" aria-hidden="true">
        {confettiEmojis.map((e, i) => (
          <span
            key={i}
            className="floating-emoji"
            style={{
              left: `${e.x}%`,
              top: `${e.y}%`,
              animationDelay: `${e.delay}s`,
              animationDuration: `${e.duration}s`,
              fontSize: `${e.size}rem`,
            }}
          >
            {e.emoji}
          </span>
        ))}
      </div>

      <div
        className="invitation-card"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Decorative header strip */}
        <div className="card-header-strip">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>

        {/* Top badge */}
        <div className="card-badge">
          <span className="badge-text">Lời mời đi quẩy</span>
        </div>

        {/* Greeting */}
        <h1 className="card-greeting">
          Hey Phương Thảo!
        </h1>
        <p className="card-subtitle">
          Bạn được mời tham gia một chuyến đi siêu vui nè~
        </p>

        {/* Decorative divider */}
        <div className="card-divider-fancy">
          <span className="divider-line" />
          <span className="divider-icon">✦</span>
          <span className="divider-line" />
        </div>

        {/* Message box */}
        <div className="card-message-box">
          <p className="card-message">
            Thứ 4 tuần sau đi <strong>Đà Nẵng</strong> chơi nha!
          </p>
          <p className="card-message">
            Mình ghé <strong>Jollibee Vincom</strong> ăn trước cho đã đời
          </p>
          <p className="card-message">
            rồi qua <strong>La Hygge</strong> uống nước nhe
          </p>
          <p className="card-message card-message-highlight">
            Đi cho vui, không đi thì cũng phải đi nha!
          </p>
        </div>

        {/* Info items */}
        <div className="card-info">
          {infoItems.map((item, index) => (
            <div
              key={item.label}
              className="info-item"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(15px)',
                transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.5 + index * 0.2}s`,
              }}
            >
              <div className="info-icon-wrapper">
                <span className="info-icon" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
              </div>
              <div className="info-content" style={{ flex: 1 }}>
                <div className="info-label">{item.label}</div>
                <div className="info-value" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: '600' }}>{item.value}</span>
                  {item.address && (
                    <span style={{ fontSize: '0.85em', opacity: 0.8, fontWeight: 'normal' }}>{item.address}</span>
                  )}
                </div>
              </div>
              {item.mapQuery && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link-icon"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--color-accent-3)',
                    marginLeft: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  title="Xem trên Google Maps"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Footer with sender */}
        <div className="card-footer">
          <div className="card-footer-decoration">
            <span>~ ~ ~</span>
          </div>
          <p className="card-sender">
            From <strong>Khôi</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
