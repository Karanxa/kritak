import React, { useEffect, useState } from 'react';
import LevelRoadmap from '../components/LevelRoadmap';
import './HomePage.css'; // Make sure to create this file if it doesn't exist

const HomePage = () => {
  const [userProgress, setUserProgress] = useState(3);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    // You would typically fetch user progress from an API here
    // For example: fetchUserProgress().then(data => setUserProgress(data.level));
  }, []);

  const handleBeginMission = () => {
    setShowRoadmap(true);
    // Scroll to roadmap section
    setTimeout(() => {
      const roadmapElement = document.querySelector('.roadmap-wrapper');
      if (roadmapElement) {
        roadmapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1>Welcome to kritak CTF</h1>
        <p>Test your hacking skills through progressively challenging levels</p>
        
        {!showRoadmap && (
          <div className="mission-intro">
            <p>Are you ready to test your skills against our most challenging security puzzles?</p>
            <button 
              className="begin-mission-btn" 
              onClick={handleBeginMission}
            >
              Begin Mission
            </button>
          </div>
        )}
      </div>
      
      {showRoadmap && (
        <div className="roadmap-wrapper">
          {isLoaded ? (
            <>
              <h2 className="select-level-title">Select Your Challenge</h2>
              <p className="level-instructions">Click on an available level to begin. Complete each level to unlock more challenges!</p>
              <LevelRoadmap userProgress={userProgress} />
            </>
          ) : (
            <div className="loading">Loading roadmap...</div>
          )}
        </div>
      )}
      
      {showRoadmap && (
        <div className="home-instructions">
          <h2>How to Play</h2>
          <p>Complete each level to unlock the next challenge. Your current progress: Level {userProgress}.</p>
          <p>Green levels are completed. Blue levels are available to play. Red levels are still locked.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
