import { useEffect, useRef, useState } from "react";

interface MobileControlsProps {
  onMove: (direction: { x: number; y: number }) => void;
  onBoost: () => void;
}

export function MobileControls({ onMove, onBoost }: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickCenterRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    joystickCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setJoystickActive(true);
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickActive) return;
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const maxDistance = 40;
    let deltaX = clientX - joystickCenterRef.current.x;
    let deltaY = clientY - joystickCenterRef.current.y;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }
    
    setJoystickPosition({ x: deltaX, y: deltaY });
    
    const normalizedX = deltaX / maxDistance;
    const normalizedY = -deltaY / maxDistance;
    onMove({ x: normalizedX, y: normalizedY });
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div
        ref={joystickRef}
        className="absolute bottom-8 left-8 pointer-events-auto"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onMouseDown={handleJoystickStart}
        onMouseMove={handleJoystickMove}
        onMouseUp={handleJoystickEnd}
        onMouseLeave={handleJoystickEnd}
      >
        <div 
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,157,0.3) 0%, rgba(255,107,157,0.1) 70%)',
            border: '3px solid rgba(255,107,157,0.5)',
            boxShadow: '0 0 20px rgba(255,107,157,0.3)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full transition-transform duration-75"
            style={{
              background: 'radial-gradient(circle, #FF6B9D 0%, #FF4080 100%)',
              boxShadow: '0 4px 15px rgba(255,107,157,0.5)',
              transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)`,
            }}
          />
        </div>
        <p className="text-center text-white text-xs mt-2 opacity-70">MOVE</p>
      </div>

      <button
        className="absolute bottom-8 right-8 pointer-events-auto w-20 h-20 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
          boxShadow: '0 4px 20px rgba(155,89,182,0.5)',
          border: '3px solid rgba(255,255,255,0.3)',
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          onBoost();
        }}
        onClick={onBoost}
      >
        <span className="text-3xl">🚀</span>
      </button>
      <p className="absolute bottom-4 right-8 text-center text-white text-xs opacity-70 w-20 pointer-events-none">BOOST</p>

      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full pointer-events-none"
        style={{
          background: 'rgba(0,0,0,0.5)',
        }}
      >
        <p className="text-white text-xs">Use joystick to swim!</p>
      </div>
    </div>
  );
}
