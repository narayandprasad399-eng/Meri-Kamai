import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';

const dummyNames = ["Rahul", "Amit", "Priya", "Sunil", "Neha", "Vikram",
  "Rohan", "Sneha", "Karan", "Pooja", "Vikas", "Anjali",
  "Deepak", "Rekha", "Mohit", "Simran", "Arjun", "Nisha"];

const earnAmounts = [20, 30, 50, 50, 50, 50, 150, 500]; // 50 more likely (referral)

const actions = [
  { text: "earned referral commission", type: "earning", emoji: "💰" },
  { text: "withdrew to UPI", type: "withdrawal", emoji: "🏦" },
  { text: "got ₹50 referral bonus", type: "earning", emoji: "🎉" },
  { text: "course referral completed", type: "earning", emoji: "✅" },
  { text: "new shop activated", type: "earning", emoji: "🚀" },
];

const maskName = (name) => {
  if (!name || name.length <= 2) return name;
  return `${name.charAt(0)}***${name.charAt(name.length - 1)}`;
};

// Cities for extra credibility
const cities = ["Delhi", "Mumbai", "Jaipur", "Lucknow", "Pune", "Bhopal", "Indore", "Surat"];

export default function LiveEarningsTicker() {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [queue, setQueue] = useState([]);
  const timerRef = useRef(null);

  const USE_REAL_DATA = false;

  const generateNotification = () => {
    const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
    const randomAmount = earnAmounts[Math.floor(Math.random() * earnAmounts.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const minutesAgo = Math.floor(Math.random() * 8) + 1;

    return {
      name: maskName(randomName),
      amount: randomAmount,
      action: randomAction.text,
      emoji: randomAction.emoji,
      type: randomAction.type,
      city: randomCity,
      time: `${minutesAgo}m ago`,
    };
  };

  useEffect(() => {
    if (USE_REAL_DATA) return;

    const showNext = () => {
      const notif = generateNotification();
      setNotification(notif);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 3500);

      const nextTime = Math.floor(Math.random() * (9000 - 4000 + 1) + 4000);
      timerRef.current = setTimeout(showNext, nextTime + 500);
    };

    timerRef.current = setTimeout(showNext, 2500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-5 left-4 z-50 transition-all duration-500 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}
      style={{ maxWidth: '300px' }}
    >
      <div className="bg-[#0d1a11] border border-[#00ff88]/25 shadow-[0_0_25px_rgba(0,0,0,0.5),0_0_15px_rgba(0,255,136,0.08)] rounded-2xl p-3.5 flex items-center gap-3">
        {/* Icon */}
        <div className="shrink-0 w-10 h-10 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-xl flex items-center justify-center text-lg">
          {notification.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-300 text-xs leading-snug">
            <span className="font-black text-white">{notification.name}</span>
            <span className="text-gray-400"> from {notification.city} </span>
            {notification.action}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#00ff88] font-black text-sm">₹{notification.amount}</span>
            <span className="text-gray-600 text-[10px]">{notification.time}</span>
          </div>
        </div>

        {/* Pulse dot */}
        <div className="shrink-0 w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
      </div>
    </div>
  );
}