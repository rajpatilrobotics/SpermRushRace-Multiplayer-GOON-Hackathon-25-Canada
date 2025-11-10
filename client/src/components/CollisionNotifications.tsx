import { useRace } from "@/lib/stores/useRace";

export default function CollisionNotifications() {
  const { collisionNotifications } = useRace();
  
  return (
    <div className="fixed top-20 left-4 pointer-events-none z-50 space-y-2">
      {collisionNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-lg p-3 border-2 border-yellow-300"
          style={{ 
            fontFamily: "'Comic Sans MS', cursive",
            animation: 'slideIn 0.3s ease-out',
            opacity: notification.timer / notification.duration,
          }}
        >
          <div className="text-sm font-bold">
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
}
