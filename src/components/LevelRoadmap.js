import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LevelRoadmap.css';

const LevelRoadmap = ({ userProgress = 1 }) => {
  // Level data with titles and descriptions
  const levels = [
    { id: 1, title: 'Beginner\'s Luck', description: 'Start your hacking journey here' },
    { id: 2, title: 'Code Breaker', description: 'Crack the hidden codes' },
    { id: 3, title: 'Packet Sniffer', description: 'Intercept network traffic' },
    { id: 4, title: 'Binary Buster', description: 'Reverse engineer the binary' },
    { id: 5, title: 'Kernel Chaos', description: 'Exploit system vulnerabilities' },
    { id: 6, title: 'Final Showdown', description: 'Master the ultimate challenge' }
  ];

  // Check if a level is accessible
  const isLevelAccessible = (levelId) => levelId <= userProgress;
  
  // Check if a level is completed
  const isLevelCompleted = (levelId) => levelId < userProgress;

  useEffect(() => {
    console.log('LevelRoadmap rendered with userProgress:', userProgress);
  }, [userProgress]);

  return (
    <div className="roadmap-container">
      <h2 className="roadmap-title">Challenge Roadmap</h2>
      <div className="roadmap-path">
        {levels.map((level, index) => (
          <React.Fragment key={level.id}>
            {/* Connect levels with path lines */}
            {index > 0 && (
              <div 
                className={`roadmap-connector ${isLevelAccessible(level.id) ? 'active' : 'locked'}`}
              />
            )}
            
            {/* Level node */}
            <div 
              className={`roadmap-level ${
                isLevelCompleted(level.id) ? 'completed' : 
                isLevelAccessible(level.id) ? 'unlocked' : 'locked'
              }`}
              style={{ '--level-id': level.id }} // For staggered animation
            >
              <Link 
                to={isLevelAccessible(level.id) ? `/level/${level.id}` : '#'}
                className={!isLevelAccessible(level.id) ? 'disabled-link' : ''}
              >
                <div className="level-node">
                  <span className="level-number">{level.id}</span>
                  {!isLevelAccessible(level.id) && <span className="lock-icon">🔒</span>}
                  {isLevelCompleted(level.id) && <span className="complete-icon">✓</span>}
                </div>
                <div className="level-info">
                  <h3>{level.title}</h3>
                  <p>{level.description}</p>
                  <span className="level-status">
                    {isLevelCompleted(level.id) ? 'Completed' : 
                     isLevelAccessible(level.id) ? 'Available' : 'Locked'}
                  </span>
                </div>
              </Link>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LevelRoadmap;
