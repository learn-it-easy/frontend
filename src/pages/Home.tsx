import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { HomeProps } from '../types/auth';
import ruFlag from '../assets/flags/ru.png';
import enFlag from '../assets/flags/en.png';
import esFlag from '../assets/flags/es.png';
import deFlag from '../assets/flags/de.png';
import frFlag from '../assets/flags/fr.png';
import video from '../assets/videos/presentation.mp4';
import videoGif from '../assets/gifs/video.gif';
import textGif from '../assets/gifs/text.gif';
import repetitionGif from '../assets/gifs/repetition.gif';

const flagImages: Record<string, string> = {
  'ru.png': ruFlag,
  'en.png': enFlag,
  'es.png': esFlag,
  'de.png': deFlag,
  'fr.png': frFlag
  
};

const Home = ({ isAuthenticated }: HomeProps) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`home-page ${isAuthenticated ? 'authenticated' : ''}`}>
      {/* Заголовок */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1><span>Learn it easily</span> — {t.home.heroSubtitle}</h1>
              <p><span>{t.home.easyRecording}</span> {t.home.and} <span>{t.home.repeat}</span> {t.home.withSRS}</p>
            </div>
           
          </div>
        </div>
      </section>

  

      {/* Абзац 1 */}
      <section className="features-section">
        <div className="container">
          <div className="feature-row">
            
          
            <div className="feature-text">
              <p>{t.home.usingApp} <span className="highlight">{t.home.youCanForget}</span><span >{t.home.boring}</span><span className="highlight">{t.home.notInteresting}</span><span>{t.home.forLearning}</span></p>
              <p><span className="highlight">{t.home.you}</span> {t.home.areFree} <span className="highlight">{t.home.choose}</span> {t.home.what} <span className="highlight">{t.home.learn}</span>!</p>
              <p><span className="highlight">{t.home.your}</span>{t.home.noMore}<span className="highlight">{t.home.noNeed}</span>{t.home.always}<span className="highlight">{t.home.switch}</span> {t.home.toTranslator} <span className="highlight">{t.home.andRecord}</span>{t.home.nonameWord}<span className="highlight">{t.home.differentrApp}</span></p>
                        
              <p>
                {t.home.plusFunctions}
              </p>

              <p>
              <span className="highlight">{t.home.everything}</span>
                {t.home.allInOne} <span className="highlight">{t.home.onePlace}</span>
              </p>

            </div>

            <div className="feature-media">
              <img src={textGif} alt={t.home.feature2Alt} />
            </div>
            
          </div>
        </div>
      </section>

      {/* Абзац 2 */}
      <section className="features-section alt">
        <div className="container">
          <div className="feature-row reverse">
          
          <div className="feature-media">
              <img src={videoGif} alt={t.home.feature2Alt} />
            </div>
          

            <div className="feature-text">
              <p>
                <span className="highlight">{t.home.learnLanguage}</span> 
                {t.home.byWatching} 
                <span className="highlight">{t.home.favoriteBloggers}</span> 
                {t.home.andReading} 
                <span className="highlight">{t.home.interestingTexts}</span>
              </p>

                <p>
                {t.home.youCan} 
                <span className="highlight">{t.home.easilyExtract}</span>
                 {t.home.allFrases}
                 <span className="highlight">{t.home.translateAndSave}</span>
                 {t.home.innerTranslater}
                 <span className="highlight">{t.home.andWriteInOneClick}</span>
                </p>

            </div>

        

          </div>
        </div>
      </section>

      {/* Абзац 3 */}
      <section className="features-section">
        <div className="container">
          <div className="feature-row">
           
            <div className="feature-text">
              <p>
                <span className="highlight">{t.home.organize}</span>
                 {t.home.systemStorage}
                 <span className="highlight">{t.home.asYouLike}</span>
                 {t.home.keepCards}
              </p>

              <p>
                <span className="highlight">{t.home.method}</span>
                {t.home.intervalInApp} 
                <span className="highlight">{t.home.allowYou}</span>
                 {t.home.incredable}
                 <span className="highlight">{t.home.effectivelyLearn}</span>
                {t.home.foreign} 
                <span className="highlight">{t.home.language}</span>
              </p>
              
              <p>
                <span className="highlight">{t.home.forgetAbout}</span>
                {t.home.endlessLoop} 
                <span className="highlight">{t.home.repetition}</span>
                {t.home.already} 
                <span className="highlight">{t.home.memorizedWords}</span>
                {t.home.methodDescription} 
                <span className="highlight">{t.home.often}</span>
                {t.home.giveYou} 
                <span className="highlight">{t.home.forgottenWords}</span>
                {t.home.butMemorizeOld} 
                
              </p>
            </div>

            <div className="feature-media">
              <img src={repetitionGif} alt={t.home.feature2Alt} />
            </div>

            
          </div>
        </div>
      </section>

   {/* Видео с функционалом */}
   <section className="video-section">
      <h2>{t.home.demonstration}</h2>
      <div className="hero-media margin-bottom">
              <video controls className="demo-video">
                <source src={video} type="video/mp4" />
                {t.home.videoNotSupported}
              </video>
      </div>
      </section>

      {/* В разработке */}
      <section className="upcoming-features">
        <div className="container">
          <h2>{t.home.inDevelopment}</h2>
          <div className="features-grid">
            <div className="features-list">
              <ul>
                <li><span>{t.home.addingGames}</span></li>
                <li><span>{t.home.importFrom}</span> Anki</li>
                <li><span>{t.home.cardVoicing}</span></li>
                <li>{t.home.sharingDecks} <span>{t.home.withFriends}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Языки */}
      <section className="languages-section">
        <div className="container">
          <h2>{t.home.supportedLanguages}</h2>
          <div className="flags-grid">
            {t.home.languages.map((lang, index) => (
              <div key={index} className="flag-item">
                <img src={flagImages[lang.flag]} alt={lang.name} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Кнопки авторизации и регистрации */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <h2>{t.home.startNow}</h2>
            <div className="cta-buttons">
              <Link to="/register" className="btn primary">{t.home.registerButton}</Link>
              <Link to="/login" className="btn secondary">{t.home.loginButton}</Link>
            </div>
          </div>
        </section>
      )}

      {/* Футер */}
      <footer className="main-footer">
        <div className="container">
          <p>{t.home.contactUs} <a href="mailto:support@learniteasily.com">support@learniteasily.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Home;