'use client';

import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

export default function RSVPButton() {
  const [clicked, setClicked] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

  const handleClick = useCallback(() => {
    if (clicked) return;
    setClicked(true);

    // Multi-burst confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#a855f7', '#ec4899', '#06b6d4', '#f59e0b', '#8b5cf6', '#22c55e'];

    // Initial big burst
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.7 },
      colors,
      startVelocity: 45,
      gravity: 0.8,
      ticks: 300,
    });

    // Side cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
      });
    }, 200);

    // Continuous smaller bursts
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 20,
        spread: 100,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.4 + 0.3,
        },
        colors,
        startVelocity: 25,
        gravity: 1.2,
      });
    }, 300);
  }, [clicked]);

  const moveNoButton = () => {
    if (typeof window !== 'undefined') {
      const maxX = window.innerWidth - 150;
      const maxY = window.innerHeight - 60;
      const randomX = Math.max(0, Math.random() * maxX);
      const randomY = Math.max(0, Math.random() * maxY);
      setNoPosition({ x: randomX, y: randomY, moved: true });
    }
  };

  return (
    <div className="rsvp-container" style={{ position: 'relative', minHeight: '120px' }}>
      {!clicked ? (
        <>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text-primary)', marginBottom: '10px' }}>
            Đi chơi hem?
          </h3>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
            <button
              className="rsvp-button"
              onClick={handleClick}
              type="button"
              style={{ padding: '0.8rem 2.5rem' }}
            >
              Yes
            </button>
            <button
              onMouseEnter={moveNoButton}
              onClick={moveNoButton}
              type="button"
              style={{
                padding: '0.8rem 2.5rem',
                fontSize: 'clamp(1rem, 3vw, 1.15rem)',
                fontWeight: '700',
                fontFamily: 'var(--font-primary)',
                color: 'var(--color-text-primary)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                position: (noPosition as any).moved ? 'fixed' : 'relative',
                left: (noPosition as any).moved ? `${noPosition.x}px` : 'auto',
                top: (noPosition as any).moved ? `${noPosition.y}px` : 'auto',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                zIndex: 9999,
              }}
            >
              No
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <button
            className="rsvp-button clicked"
            type="button"
            style={{ padding: '0.8rem 2.5rem' }}
          >
            OK luôn!
          </button>
          <p className="rsvp-response" style={{ fontSize: '1.1rem' }}>
            Okiee! Chốt đơn nha!
          </p>
        </div>
      )}
    </div>
  );
}
