import { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageContext } from '../contexts/LanguageContext';
import { AxiosError } from 'axios';
import {
  ApiErrorResponse,
  AllFolderData,
  Folder,
  HomeProps
} from '../types/auth';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { authApi } from '../api/authApi';

const Folders = ({ isAuthenticated }: HomeProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [allFolderData, setAllFolderData] = useState<AllFolderData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const history = useHistory();
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const createFolderInputRef = useRef<HTMLInputElement>(null);
  const editFolderInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<number | null>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const [folderToDeleteName, setFolderToDeleteName] = useState<string>('');


  const fetchFolders = async (page: number) => {
    try {
      setLoading(true);

      const foldersPromise = authApi.getFolders(page, language)
        .catch(error => {
          if (error.response?.status === 204) {
            return { folders: [], currentPage: 1, totalPages: 1 };
          }
          throw error;
        });

      const [foldersResponse, allFolderResponse] = await Promise.all([
        foldersPromise,
        authApi.getAllFolderData(language)
      ]);

      setFolders(foldersResponse.folders);
      setAllFolderData(allFolderResponse);
      setCurrentPage(foldersResponse.currentPage);
      setTotalPages(foldersResponse.totalPages);
    } catch (err) {
      console.error('Error fetching folders:', err);
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(t.folders.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (folderId: number, folderName: string) => {
    setFolderToDelete(folderId);
    setFolderToDeleteName(folderName);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!folderToDelete) return;

    try {
      await authApi.deleteFolder(folderToDelete, language);
      setShowDeleteModal(false);
      setFolderToDelete(null);
      fetchFolders(currentPage);
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError(t.folders.errorDeleting);
      setShowDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setFolderToDelete(null);
  };

  useEffect(() => {
    if (showCreateModal && createFolderInputRef.current) {
      createFolderInputRef.current.focus();
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (showEditModal && editFolderInputRef.current) {
      editFolderInputRef.current.focus();
    }
  }, [showEditModal]);

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && folderName.trim()) {
      handleCreateFolder();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && folderName.trim()) {
      handleEditFolder();
    }
  };

  useEffect(() => {
    fetchFolders(currentPage);
  }, [currentPage, language]);

  const handleCreateFolder = async () => {
    try {
      await authApi.createFolder(folderName, language);
      setShowCreateModal(false);
      setFolderName('');
      fetchFolders(currentPage);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(t.folders.errorCreating);
    }
  };

  const handleEditFolder = async () => {
    if (!editingFolderId) return;

    try {
      await authApi.updateFolderName(editingFolderId, folderName, language);
      setShowEditModal(false);
      setFolderName('');
      setEditingFolderId(null);
      fetchFolders(currentPage);
    } catch (err) {
      console.error('Error editing folder:', err);
      setError(t.folders.errorEditing);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return < Loader />;
  }

  if (error) {
    return (
      <div className="folders-page">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()}>
          {t.common.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="folders-page">
      {isAuthenticated && <Navbar />}
      <div className="main-content">
        <div className="folders-header">
          <h1>{t.folders.title}</h1>
          <button
            className="add-folder-button"
            onClick={() => setShowCreateModal(true)}
          >
            {t.folders.addFolder}
          </button>
        </div>
        <>
          <div className="folders-grid">
            {currentPage === 1 && allFolderData && (
              <div className="folder-card all-folder">
                <h3>{t.folders.allFolders}</h3>
                <p>{t.folders.cardsCount}: {allFolderData.cardCount}</p>
                {allFolderData.cardCount > 0 && allFolderData.nearestReviewTime && (
                  <p>
                    {allFolderData.nearestReviewTime.value === 0
                      ? t.folders.nearestReviewNow
                      : `${t.folders.nearestReview}: ${allFolderData.nearestReviewTime.value} ${allFolderData.nearestReviewTime.unit}`}
                  </p>
                )}
                <div className="folder-actions">
                  <button
                    className="action-button view-button"
                    onClick={() => history.push('/cards')}
                  >
                    {t.folders.view}
                  </button>
                </div>
              </div>
            )}

            {folders.map(folder => (
              <div key={folder.id} className="folder-card">
                <h3>{folder.name}</h3>
                <p>{t.folders.cardsCount}: {folder.cardCount}</p>
                {folder.cardCount > 0 && folder.nearestReviewTime && (
                  <p>
                    {folder.nearestReviewTime.value === 0
                      ? t.folders.nearestReviewNow
                      : `${t.folders.nearestReview}: ${folder.nearestReviewTime.value} ${folder.nearestReviewTime.unit}`}
                  </p>
                )}
                <div className="folder-actions">
                  <button
                    className="action-button folder-edit-button"
                    onClick={() => {
                      setEditingFolderId(folder.id);
                      setFolderName(folder.name);
                      setShowEditModal(true);
                    }}
                  >
                    {t.folders.edit}
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDeleteClick(folder.id, folder.name)}
                  >
                    {t.folders.delete}
                  </button>
                  <button
                    className="action-button view-button"
                    onClick={() => history.push(`/cards?folderId=${folder.id}`)}
                  >
                    {t.folders.view}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              {t.folders.previous}
            </button>
            <span>{t.folders.page} {currentPage} {t.folders.of} {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              {t.folders.next}
            </button>
          </div>
        </>
      </div>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title={t.folders.confirmDeleteTitle}
      >
        <div className="modal-body" ref={deleteModalRef}>
          <p>
            {t.folders.confirmDeleteMessage}
            <strong> "{folderToDeleteName}"</strong>?
          </p>
          <div className="modal-footer">
            <button
              className="modal-button confirm delete-button"
              onClick={handleConfirmDelete}
            >
              {t.folders.delete}
            </button>
          </div>
        </div>
      </Modal>
      {/* Create Folder Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t.folders.createFolder}
      >
        <div className="modal-body">
          <input
            ref={createFolderInputRef}
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleCreateKeyDown}
            placeholder={t.folders.folderNamePlaceholder}
            className="modal-input"
          />
          <div className="modal-footer">
            <button
              className="modal-button confirm"
              onClick={handleCreateFolder}
              disabled={!folderName.trim()}
            >
              {t.folders.create}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Folder Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t.folders.editFolder}
      >
        <div className="modal-body">
          <input
            ref={editFolderInputRef}
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleEditKeyDown}
            placeholder={t.folders.folderNamePlaceholder}
            className="modal-input"
          />
          <div className="modal-footer">
            <button
              className="modal-button confirm"
              onClick={handleEditFolder}
              disabled={!folderName.trim()}
            >
              {t.folders.change}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Folders;