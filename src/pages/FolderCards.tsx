import { useState, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageContext } from '../contexts/LanguageContext';
import {
  ApiErrorResponse,
  Folder,
  Card,
  UpdateData
} from '../types/auth';
import Loader from '../components/Loader';
import { authApi } from '../api/generalApi';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { CardReviewModal } from '../components/UpdateConfirmationModal';
import { useCards } from '../contexts/CardContext';
import backIcon from '../assets/back-button.png';
import editIcon from '../assets/edit.png';
import trashIcon from '../assets/trash.png';



const FolderCards = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderName, setCurrentFolderName] = useState<string>('');
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<{ id: number | null, mainWord: string }>({ id: null, mainWord: '' });
  const [updateData, setUpdateData] = useState<UpdateData>({
    folderId: null,
    text: '',
    textTranslation: '',
    isImage: false
  });
  const history = useHistory();
  const location = useLocation();
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const folderId = new URLSearchParams(location.search).get('folderId') || '';
  const { refreshCards, cardsRefreshTrigger } = useCards();

  const fetchCards = async (page: number) => {
    try {
      setLoading(true);
      const response = await authApi.getCardsFromFolder(folderId, page, language);
      setCards(response.cards);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError({ message: t.folders.errorLoading });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFolders = async () => {
    try {
      const allFolders = await authApi.getAllFolders(language);
      setFolders(allFolders);

      const currentFolder = allFolders.find(f => f.id === parseInt(folderId));
      if (currentFolder) {
        setCurrentFolderName(currentFolder.name);
        setUpdateData(prev => ({ ...prev, folderId: currentFolder.id }));
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  };


  useEffect(() => {
    if (folderId) {
      fetchCards(currentPage);
      fetchAllFolders();
    }
  }, [currentPage, language, folderId, cardsRefreshTrigger]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditClick = async (card: Card) => {
    try {
      if (!card?.cardId) {
        throw new Error('Card ID is required');
      }

      setLoading(true);
      const fullCardData = await authApi.getCardDetails(card.cardId, language);

      if (!fullCardData.cardId) {
        throw new Error('API returned invalid card data');
      }

      setEditingCard(fullCardData);
      setUpdateData({
        folderId: fullCardData.folderId || null,
        text: fullCardData.text || card.mainWord || '',
        textTranslation: fullCardData.textTranslation || '',
        isImage: fullCardData.isImage || false
      });
      setShowEditModal(true);
    } catch (err) {
      console.error('Error in handleEditClick:', err);
      setError({ message: err instanceof Error ? err.message : 'Failed to load card' });
    } finally {
      setLoading(false);
    }
  };


  const isImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      const lowerUrl = url.toLowerCase();
      return lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/) !== null;
    } catch {
      return false;
    }
  };

  const handleUpdateCard = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!editingCard?.cardId) {
        throw new Error('No card selected for update');
      }

      await authApi.updateCard(editingCard.cardId, {
        ...updateData,
        folderId: updateData.folderId
      }, language);

      setShowEditModal(false);
      fetchCards(currentPage);
      refreshCards();
    } catch (err) {
      console.error('Update failed:', err);
      setError({
        message: err instanceof Error ? err.message : t.folders.errorEditing
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteCard = async (cardId: number) => {
    try {
      await authApi.deleteCard(cardId, language);
      fetchCards(currentPage);
      refreshCards();
    } catch (err) {
      console.error('Error deleting card:', err);
      setError({ message: t.folders.errorDeleting });
    }
  };

  const handleDeleteClick = (cardId: number, mainWord: string) => {
    setCardToDelete({ id: cardId, mainWord });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (cardToDelete.id) {
      await handleDeleteCard(cardToDelete.id);
      setShowDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const formatDate = (dateArray: number[]): string => {
    if (!dateArray || dateArray.length < 7) return '';
    const [year, month, day, hour, minute] = dateArray;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="folder-cards-page">
        <div className="error-message">{error && (
          <div className="error-message">
            {error.message}
          </div>
        )}</div>
        <button onClick={() => window.location.reload()}>
          {t.common.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="folder-cards-page">
      <div className="main-content main-content-folder">
        <div className="cards-header">
          <h1>
            {currentFolderName}
          </h1>
          <button
            className="back-button"
            onClick={() => history.push('/folders')}
          >
            <span>{t.common.back}</span>
            <img src={backIcon} alt="Back" className="back-icon" />
          </button>
        </div>

        <div className="cards-container">
          {cards.map(card => (
            <div key={card.cardId} className="card-item">
              <div className="card-content">
                <div className="card-text">
                  <h3 className="card-main-word">{card.mainWord}</h3>
                  {card.nextReviewAt && (
                    <p className="card-review-date">
                      {t.folders.nearestReview}: {formatDate(card.nextReviewAt)}
                    </p>
                  )}
                </div>
                <div className="card-actions">
                  <button
                    className="action-button action-button-folder edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(card);
                    }}
                    title={t.folders.edit}
                  >
                    <img src={editIcon} alt="Edit" className="action-icon" />
                    <span>{t.folders.edit}</span>
                  </button>
                  <button
                    className="action-button action-button-folder delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(card.cardId, card.mainWord);
                    }}
                    title={t.folders.delete}
                  >
                    <img src={trashIcon} alt="Delete" className="action-icon" />
                    <span>{t.folders.delete}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 0 && (

          <div className="pagination-wrapper">
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <span>{t.folders.previous}</span>
              </button>
              <span>
                {t.folders.page} {currentPage} {t.folders.of} {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <span>{t.folders.next}</span>
              </button>
            </div>
          </div>

        )}
        {cards.length === 0 && !loading && (
          <div className="content-no-card folder-bottom">
            <div className="no-cards-message">
              {t.folders.noCardsAvailable}
            </div>
          </div>
        )}

      </div>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        cardName={cardToDelete.mainWord}
        t={t}
      />
      {/* Edit Card Modal */}
      <CardReviewModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdateCard}
        updateData={updateData}
        setUpdateData={setUpdateData}
        folders={folders}
        t={t}
      />
    </div>
  );
};

export default FolderCards;