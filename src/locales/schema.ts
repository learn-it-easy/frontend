import { Translation } from '../types/translations';

const translationSchema: Translation = {
  header: {
    registerButton: '',
    loginButton: '',
    logoutButton: ''
  },
  common: {
    welcome: '',
    username: '',
    email: '',
    password: '',
    learningLanguage: '',
    nativeLanguage: '',
    tryAgain: '',
    unknow: '',
  },
  validation: {
    usernameRequired: '',
    usernameLength: '',
    emailRequired: '',
    emailInvalid: '',
    passwordRequired: '',
    passwordLength: '',   
    chooseLanguage: '',
  },
  registration: {
    chooseLearningLanguage: '',
    chooseNativeLanguage: '',
    errorLaunchLanguages: '',
    errorOfRegistration: '',
    registrationLabel: '',
    registerButton: '',
    loadingLanguages: '',
  },
  login: {
    errorOfLogin: '',
    labelEnter: '',
    username: '',
    password: '',
    loginButton: '',
    usernameRequired: '',
    usernameLength: '',
    passwordRequired: '',
    passwordLength: '', 

  },
  navbar: {
    main: '',
    profile: '',
    folders: '',
    add: '',
  },
  home: {
    welcomeHeader: '',
    test: '',
    registerButton: '',
    loginButton: '',
  },
  profile: {
    errorLoading: '',
    loading: '',
    title: '',
    editButton: '',
    noData: '',
    errorUpdating: '',
    editTitle: '',
    updateSuccess: '',
    passwordPlaceholder: '',
    selectLanguage: '',
    saveButton: '',
    cancelButton: '',
  },
};

export default translationSchema;