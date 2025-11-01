import { useEffect, useState } from 'react';
import './CreditAnimation.css';

const CreditAnimation = ({ from, to, amount = 10 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const duration = 1000;
  
  // Create 5 coins like before
  const numCoins = 5;
  const coins = Array.from({ length: numCoins }, (_, index) => {
    // Calculate random offset for each coin's path
    const randomOffsetX = (Math.random() - 0.5) * 100; // -50 to 50px
    const randomOffsetY = (Math.random() - 0.5) * 80; // -40 to 40px
    const delay = index * 70; // Stagger coins by 70ms
    const randomDuration = duration + (Math.random() - 0.5) * 150;

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