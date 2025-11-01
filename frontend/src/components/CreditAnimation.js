import { useEffect, useState } from 'react';
import './CreditAnimation.css';

const CreditAnimation = ({ from, to }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const duration = 1000; // 1 second
  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
  );

  return (
    <div
      className="credit-animation"
      style={{
        '--from-x': `${from.x}px`,
        '--from-y': `${from.y}px`,
        '--to-x': `${to.x}px`,
        '--to-y': `${to.y}px`,
        '--duration': `${duration}ms`,
        left: `${from.x}px`,
        top: `${from.y}px`,
      }}
    >
      <div className="coin-container">
        <div className="coin">
          <span className="coin-text">+10</span>
        </div>
      </div>
    </div>
  );
};

export default CreditAnimation;