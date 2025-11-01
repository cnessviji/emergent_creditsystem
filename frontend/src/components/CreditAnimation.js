import { useEffect, useState } from 'react';
import './CreditAnimation.css';

const CreditAnimation = ({ from, to, amount = 10 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const duration = 900; // Slightly faster for smoothness
  
  // Create 3 coins for optimal performance and visual effect
  const numCoins = 3;
  const coins = Array.from({ length: numCoins }, (_, index) => {
    // Calculate random offset for each coin's path
    const randomOffsetX = (Math.random() - 0.5) * 60; // -30 to 30px
    const randomOffsetY = (Math.random() - 0.5) * 50; // -25 to 25px
    const delay = index * 60; // Stagger coins by 60ms
    const randomDuration = duration + (Math.random() - 0.5) * 100; // Vary speed slightly

    return {
      id: index,
      offsetX: randomOffsetX,
      offsetY: randomOffsetY,
      delay,
      duration: randomDuration,
    };
  });

  return (
    <>
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="credit-animation"
          style={{
            '--from-x': `${from.x}px`,
            '--from-y': `${from.y}px`,
            '--to-x': `${to.x}px`,
            '--to-y': `${to.y}px`,
            '--offset-x': `${coin.offsetX}px`,
            '--offset-y': `${coin.offsetY}px`,
            '--duration': `${coin.duration}ms`,
            '--delay': `${coin.delay}ms`,
            left: `${from.x}px`,
            top: `${from.y}px`,
          }}
        >
          <div className="coin-container">
            <div className="coin">
              <span className="coin-text">+{amount}</span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default CreditAnimation;