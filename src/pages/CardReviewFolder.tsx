import React, { useState, useEffect, useContext } from 'react';
import axios, { AxiosError } from 'axios';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { ApiErrorResponse, Card, Folder, HomeProps, UpdateData } from '../types/auth';
import { authApi, cardService } from '../api/authApi';
import Loader from '../components/Loader';
import { useHistory, useLocation } from 'react-router-dom';
import { CardReviewModal } from '../components/UpdateConfirmationModal';
import trashIcon from '../assets/trash.png';
import editIcon from '../assets/edit.png';
import backIcon from '../assets/back-button.png';

interface CardData {
    folderId: number | null;
    text: string;
    textTranslation: string;
    isImage: boolean;
    cardId: number;
    mainWord?: string;
}

const formatText = (text: string) => {
    const parts = text.split(/(==[^=]+==)/g);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('==') && part.endsWith('==')) {
                    const word = part.slice(2, -2);
                    return (
                        <span
                            key={index}
                            className="word-background"
                        >
                            {word}
                        </span>
                    );
                }
                return part;
            })}
        </span>
    );
};

const CardReview = ({ isAuthenticated }: HomeProps) => {
    const { language } = useContext(LanguageContext);
    const history = useHistory();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const folderId = searchParams.get('folderId') ? parseInt(searchParams.get('folderId')!) : null;
    const { t } = useTranslation();
    const [card, setCard] = useState<CardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [viewMode, setViewMode] = useState<'text' | 'translation'>('text');
    const [folders, setFolders] = useState<Folder[]>([]);
    const [updateData, setUpdateData] = useState<UpdateData>({
        folderId: null,
        text: '',
        textTranslation: '',
        isImage: false
    });
    const [noCardsMessage, setNoCardsMessage] = useState<string | null>(null);

    const fetchCard = async () => {
        setLoading(true);
        try {

            const response = folderId
                ? await cardService.getReviewCard(language, folderId)
                : await cardService.getReviewCardAll(language);


            if (typeof response === 'object' && 'message' in response && 'field' in response && response.field === null) {
                setNoCardsMessage(response.message || null);
                setCard(null);
                return;
            }

            setNoCardsMessage(null);
            const transformedCard: CardData = {
                folderId: response.folderId ?? null,
                text: response.text,
                textTranslation: response.textTranslation,
                isImage: response.isImage ?? false,
                cardId: response.cardId,
                mainWord: response.text
            };
            setCard(transformedCard);
            setUpdateData({
                folderId: transformedCard.folderId,
                text: transformedCard.text,
                textTranslation: transformedCard.textTranslation,
                isImage: transformedCard.isImage
            });
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            setError(error.response?.data?.message || t.cards.notReviewCards || 'Failed to fetch card');
        } finally {
            setLoading(false);
        }
    };

    const fetchFolders = async () => {
        try {
            const foldersData = await authApi.getAllFolders(language);
            setFolders(foldersData);
        } catch (err) {
            console.error('Failed to fetch folders', err);
        }
    };

    useEffect(() => {
        fetchCard();
        fetchFolders();
    }, [language]);

    useEffect(() => {
        if (card) {
            setViewMode(card.isImage ? 'translation' : 'text');
        }
    }, [card]);

    const handleDifficulty = async (difficulty: 'easy' | 'medium' | 'hard') => {
        if (!card) return;

        try {
            await cardService.submitDifficulty(card.cardId, difficulty, language);
            fetchCard();
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            setError(error.response?.data?.message || 'Failed to submit difficulty');
        }
    };

    const handleUpdateCard = async () => {
        if (!card) return;

        try {
            await authApi.updateCard(card.cardId, updateData, language);
            setCard({
                ...card,
                ...updateData,
                folderId: updateData.folderId ?? card.folderId
            });
            setShowEditModal(false);
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            setError(error.response?.data?.message || 'Failed to update card');
        }
    };

    const handleDeleteCard = async () => {
        if (!card) return;

        try {
            await authApi.deleteCard(card.cardId, language);
            setShowDeleteModal(false);
            fetchCard();
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            setError(error.response?.data?.message || 'Failed to delete card');
        }
    };

    if (loading) return <Loader />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="card-review-container">


            <button
                className="back-button-review"
                onClick={() => history.push('/folders')}
            >
                <span>{t.common.back}</span>
                <img src={backIcon} alt="Back" className="back-icon" />
            </button>

            {noCardsMessage || !card ? (
                <div className="content-no-card-review">



                    <div className="no-cards-message">
                        {noCardsMessage}
                    </div>
                </div>
            ) : (
                <>
                    <div className="card-review-header">
                        <button
                            className="edit-icon"
                            onClick={() => setShowEditModal(true)}
                            title="Edit card"
                        >
                            <img
                                src={editIcon}
                                alt="Edit"
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    padding: '4px'
                                }}
                            />
                        </button>

                        <button
                            className="trash-button"
                            onClick={() => setShowDeleteModal(true)}
                            title="Delete card"
                        >
                            <img
                                src={trashIcon}
                                alt="Delete"
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    padding: '4px'
                                }}
                            />
                        </button>
                    </div>

                    <div className="card-content-review">
                        {card.isImage ? (
                            viewMode === 'translation' ? (
                            <div className="card-image">
                                    <img
                                        src={card.textTranslation}
                                        alt={card.text}
                                        className="image-content"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="card-text">
                                    {formatText(card.text)}
                                </div>
                            )
                        ) : (
                            viewMode === 'text' ? (
                                <div className="card-text">
                                    {formatText(card.text)}
                                </div>
                            ) : (
                                <div className="card-translation">
                                    {formatText(card.textTranslation)}
                                </div>
                            )
                        )}
                    </div>

                    <button
                        className="toggle-view-button"
                        onClick={() => setViewMode(viewMode === 'text' ? 'translation' : 'text')}
                    >
                        {card.isImage ? (
                            viewMode === 'text' ? t.cards.showImage : t.cards.showText
                        ) : (
                            viewMode === 'text' ? t.cards.showTranslation : t.cards.showText
                        )}
                    </button>

                    <div className="card-actions-review">

                        <button
                            className="difficulty-button hard"
                            onClick={() => handleDifficulty('hard')}
                        >
                            {t.cards.hard}
                        </button>

                        <button
                            className="difficulty-button medium"
                            onClick={() => handleDifficulty('medium')}
                        >
                            {t.cards.medium}
                        </button>


                        <button
                            className="difficulty-button easy"
                            onClick={() => handleDifficulty('easy')}
                        >
                            {t.cards.easy}
                        </button>
                    </div>
                </>
            )}

            <CardReviewModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onUpdate={handleUpdateCard}
                updateData={updateData}
                setUpdateData={setUpdateData}
                folders={folders}
                t={t}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteCard}
                cardName={card?.text || ''}
                t={t}
            />
        </div>
    );
};

export default CardReview;