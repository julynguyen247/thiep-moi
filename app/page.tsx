'use client';

import dynamic from 'next/dynamic';
import InvitationCard from '@/components/InvitationCard';
import RSVPButton from '@/components/RSVPButton';

// Dynamic import Three.js scene to avoid SSR issues
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, #1a1035 0%, #0a0a1a 70%)',
        zIndex: 0,
      }}
    />
  ),
});

export default function Home() {
  return (
    <main className="main-container" id="invitation-page">
      {/* 3D Background */}
      <Scene3D />

      {/* Invitation Content */}
      <div className="invitation-wrapper">
        <InvitationCard />
        <RSVPButton />
      </div>
    </main>
  );
}
