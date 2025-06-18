import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchSubtitles } from '../api/subsApi';
import { HomeProps } from '../types/auth';
import { TextSelectionMenu } from '../components/TextAddContextMenu';
import AddCardModal from '../components/AddCardModal';
import { useTranslation } from '../hooks/useTranslation';
import Loader from '../components/Loader';
import ReactDOM from 'react-dom';
import { MobileRotateWrapper } from '../components/MobileRotateWrapper';
import { useIsMobile } from '../hooks/useIsMobile';

interface Subtitle {
  start: string;
  end: string;
  text: string;
  isActive?: boolean;
}

const YouTubeSubtitleViewer: React.FC<HomeProps> = ({ isAuthenticated }: HomeProps) => {
  const { t } = useTranslation();
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const playerRef = useRef<any>(null);
  const subtitlesContainerRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(true);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isMobile = useCallback(() => {
    return window.innerWidth <= 500;
  }, []);

  const isMobileHook = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const id = extractVideoId(videoUrl);
    if (!id) {
      setError(t.video.invalidURL);
      return;
    }

    // Сбрасываем состояние перед загрузкой новых данных
    setSubtitles([]);
    setCurrentTime(0);
    setIsLoading(true);
    if (isMobile()) {
      setShowForm(false);
    }

    try {
      const { language, subtitles } = await fetchSubtitles(videoUrl);
      setLanguage(language);
      setSubtitles(subtitles);
      setVideoId(id);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.video.failedToFetchSubs);
      setSubtitles([]);
      setVideoId('');
    } finally {
      setIsLoading(false);
    }
  };

  const timeToSeconds = useCallback((timeStr: string): number => {
    const [hms, ms] = timeStr.split(',');
    const [hours, minutes, seconds] = hms.split(':');
    return (
      parseInt(hours) * 3600 + 
      parseInt(minutes) * 60 + 
      parseInt(seconds) + 
      parseInt(ms) / 1000
    );
  }, []);

  useEffect(() => {
    if (!videoId) return;

    let player: any;
    let updateInterval: NodeJS.Timeout;

    const onPlayerReady = (event: any) => {
      updateInterval = setInterval(() => {
        const time = event.target.getCurrentTime();
        setCurrentTime(time);
      }, 250);
    };

    const initializePlayer = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
          player = new (window as any).YT.Player('youtube-player', {
            videoId: videoId,
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange,
              'onError': (event: any) => {
                console.error('YouTube Player Error:', event.data);
                setError('Failed to load video');
              }
            },
            playerVars: {
              enablejsapi: 1,
              origin: window.location.origin,
              rel: 0,
              modestbranding: 1
            }
          });
          playerRef.current = player;
        };
      } else {
        player = new (window as any).YT.Player('youtube-player', {
          videoId: videoId,
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': (event: any) => {
              console.error('YouTube Player Error:', event.data);
              setError('Failed to load video');
            }
          },
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
            modestbranding: 1
          }
        });
        playerRef.current = player;
      }
    };

    initializePlayer();

    return () => {
      // Очистка при размонтировании
      clearInterval(updateInterval);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if ((window as any).onYouTubeIframeAPIReady) {
        delete (window as any).onYouTubeIframeAPIReady;
      }
    };
  }, [videoId]);

  const onPlayerReady = (event: any) => {
    const updateInterval = setInterval(() => {
      const time = event.target.getCurrentTime();
      setCurrentTime(time);
    }, 250);
    
    return () => clearInterval(updateInterval);
  };

  const onPlayerStateChange = (event: any) => {
    // Можно сделать обработку событий плеера потом
  };

  const getCurrentSubtitles = useCallback((): (Subtitle & { isActive: boolean })[] => {
    if (subtitles.length === 0) return [];
    
    const currentSec = currentTime;
    let nextSubIdx = subtitles.findIndex(sub => timeToSeconds(sub.start) > currentSec);
  
    if (nextSubIdx === 0) {
      return subtitles.slice(0, isMobile() ? 3 : 5).map((sub, idx) => ({
        ...sub,
        isActive: idx === 0
      }));
    }
  
    if (nextSubIdx === -1) {
      return subtitles.slice(isMobile() ? -2 : -5).map((sub, idx) => ({
        ...sub,
        isActive: idx === (isMobile() ? 1 : 4)
      }));
    }
  
    const activeIdx = nextSubIdx;
    const startIdx = Math.max(0, activeIdx - (isMobile() ? 1 : 2));
    const endIdx = Math.min(subtitles.length, activeIdx + (isMobile() ? 2 : 4));
    
    return subtitles.slice(startIdx, endIdx).map((sub, idx) => ({
      ...sub,
      isActive: idx === (activeIdx - startIdx)
    }));
  }, [subtitles, currentTime, timeToSeconds, isMobile]);

  const currentSubtitles = getCurrentSubtitles();

  const handleTextSelection = (text: string) => {
    setSelectedText(text);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddCard = () => {
    setIsAddModalOpen(false);
  };



  return (
    <div className="video-page">
    {showForm && (
      <form onSubmit={handleSubmit} className="video-form">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder={t.video.enterURL}
          className="video-input"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="video-button"
        >
          {isLoading ? t.video.loading && <Loader/> : t.video.load}
        </button>
      </form>
    )}
      {error && <div className="error-message">{error}</div>}

      {videoId && (
        <div className="video-container">
          <div className="video-player">
            <div id="youtube-player"></div>
          </div>
          
          <div className="subtitles-container" ref={subtitlesContainerRef}>
            <h3>{t.video.subtitles} ({language})</h3>
            <div className="subtitles-list">
              {currentSubtitles.map((sub, idx) => (
                <div 
                  key={`${sub.start}-${idx}`}
                  className={`subtitle-item ${sub.isActive ? 'active' : ''}`}
                >
                  <div className="subtitle-text">
                    {sub.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

<MobileRotateWrapper isMobile={isMobileHook} />

      <TextSelectionMenu
        targetRef={subtitlesContainerRef}
        onAddCard={handleTextSelection}
      />

      {isAddModalOpen && ReactDOM.createPortal(
        <AddCardModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          onCardAdded={handleAddCard}
          initialText={selectedText}
        />,
        document.body
      )}
    </div>
  );
};

export default YouTubeSubtitleViewer;