export const SUPPORTED_LANGUAGES = ['ru', 'en', 'es', 'de', 'fr'] as const;
export type LanguageCode = typeof SUPPORTED_LANGUAGES[number];

export interface Translation {
  header: {
    registerButton: string;
    loginButton: string;
    logoutButton: string;
  };
  common: {
    welcome: string;
    username: string;
    email: string;
    password: string;
    learningLanguage: string;
    nativeLanguage: string;
    tryAgain: string;
    unknow: string;
    back: string;
    create: string;
    highlightText: string;
    removeHihglightText: string;
    write: string;
  };
  validation: {
    usernameRequired: string;
    usernameLength: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordLength: string;
    chooseLanguage: string;
  }
  registration: {    
    chooseLearningLanguage: string;
    chooseNativeLanguage: string;
    errorLaunchLanguages: string;
    errorOfRegistration: string;
    registrationLabel: string;
    registerButton: string;
    loadingLanguages: string;
  };
  login: {
    errorOfLogin: string;
    labelEnter: string;
    username: string;
    password: string;
    loginButton: string;
    usernameRequired: string;
    usernameLength: string;
    passwordRequired: string;
    passwordLength: string; 
  };
  navbar: {
    main: string;
    profile: string;
    folders: string;
    add: string;
    text: string;
  };
  home: {
    welcomeHeader: string;
    test: string;
    registerButton: string;
    loginButton: string;
  };
  profile: {
    errorLoading: string;
    loading: string;
    title: string;
    editButton: string;
    noData: string;
    errorUpdating: string;
    editTitle: string;
    updateSuccess: string;
    passwordPlaceholder: string;
    selectLanguage: string;
    saveButton: string;
    cancelButton: string;
  };
  folders: {
    title: string;
    allFolders: string;
    cardsCount: string;
    nearestReviewAt: string;
    nearestReview: string;
    nearestReviewNow: string;
    noReviews: string;
    addFolder: string;
    createFolder: string;
    editFolder: string;
    folderNamePlaceholder: string;
    confirmDelete: string;
    view: string;
    errorLoading: string;
    errorCreating: string;
    errorEditing: string;
    errorDeleting: string;
    edit: string;
    delete: string;
    previous: string;
    page: string;
    of: string;
    next: string;
    cancel: string;
    create: string;
    change: string;
    confirmDeleteTitle: string;
    confirmDeleteMessage: string;
    text: string;
    textTranslation: string;
    noCardsAvailable: string;
    allCards: string;
    noFolder: string;
    confirmDeleteMessageCard: string;
    folder: string;
  };

  cards: {
    invalidImageUrl: string;
    isImage: string;
    fillRequiredFieldsText: string;
    fillRequiredFieldsTextTranslate: string;
    notReviewCards: string;
    easy: string;
    medium: string;
    hard: string;
    showTranslation: string;
    showText: string;
    changeCard: string;
    placeholder: string;
  },
  textPage: {
    title: string;
    placeholder: string;
    dragAndDropHint: string;
    usageHint: string;
    clearText: string;
    readMode: string;
    editMode: string;
    emptyText: string;
    sentencesOnPage: string;
  },
}