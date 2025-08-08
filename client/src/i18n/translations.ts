export const translations = {
  ru: {
    // Common
    save: 'Сохранить',
    cancel: 'Отмена',
    close: 'Закрыть',
    back: 'Назад',
    next: 'Далее',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    
    // Navigation
    dashboard: 'Дашборд',
    projects: 'Проекты',
    settings: 'Настройки',
    logout: 'Выход',
    
    // Auth
    login: 'Вход',
    register: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    firstName: 'Имя',
    lastName: 'Фамилия',
    signIn: 'Войти',
    createAccount: 'Создать аккаунт',
    signInWithGoogle: 'Войти через Google',
    comingSoon: 'Скоро',
    welcomeBack: 'С возвращением!',
    loginSuccess: 'Вы успешно вошли в систему.',
    accountCreated: 'Аккаунт создан!',
    welcomeTo: 'Добро пожаловать в LinkForge.',
    loginFailed: 'Ошибка входа',
    registrationFailed: 'Ошибка регистрации',
    invalidCredentials: 'Неверные данные',
    emailExists: 'Email уже используется',
    
    // Projects
    projectName: 'Название проекта',
    domain: 'Домен',
    createProject: 'Создать проект',
    createNewProject: 'Создать новый проект',
    noProjects: 'Пока нет проектов',
    createFirstProject: 'Создайте свой первый проект для начала работы с внутренними ссылками.',
    createYourFirstProject: 'Создать первый проект',
    manageProjects: 'Управление проектами внутренних ссылок',
    
    // Settings
    changePassword: 'Изменить пароль',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    confirmPassword: 'Подтвердить новый пароль',
    passwordChanged: 'Пароль успешно изменен.',
    passwordsDontMatch: 'Новые пароли не совпадают.',
    incorrectPassword: 'Текущий пароль неверен',
    
    // Project Steps
    csvImport: 'Импорт CSV',
    globalParameters: 'Глобальные параметры',
    quickTasks: 'Быстрые задачи',
    launchProgress: 'Запуск и прогресс',
    draftReview: 'Просмотр черновика',
    runHistory: 'История запусков',
    
    // CSV Import
    dropCsvFile: 'Перетащите CSV файл сюда',
    clickToBrowse: 'или нажмите для выбора',
    invalidFile: 'Неверный файл',
    selectCsvFile: 'Пожалуйста, выберите CSV файл.',
    csvParseError: 'Ошибка парсинга CSV',
    previewRows: 'Предпросмотр (первые 20 строк)',
    totalRows: 'Всего строк обнаружено',
    processData: 'Обработать данные',
    processing: 'Обработка...',
    processingPhases: 'Этапы обработки',
    processingLogs: 'Логи обработки',
    downloadLog: 'Скачать лог',
    processingComplete: 'Обработка завершена',
    processedPages: 'Успешно обработано страниц',
    
    // Global Parameters
    maxLinksPerPage: 'Максимум новых ссылок на страницу',
    priorityOrder: 'Порядок приоритетов (перетащите для изменения)',
    limitsAndRules: 'Лимиты и правила',
    minGapWords: 'Мин. разрыв (слова)',
    exactAnchorPercent: 'Точный анкор %',
    oldLinks: 'Старые ссылки',
    brokenLinks: 'Сломанные ссылки',
    htmlClass: 'HTML класс',
    linkMode: 'Режим ссылок',
    stopAnchors: 'Стоп-анкоры (по одному в строке)',
    linkAttributes: 'Атрибуты ссылок',
    enrich: 'Обогатить',
    regenerate: 'Пересоздать',
    audit: 'Аудит',
    delete: 'Удалить',
    replace: 'Заменить',
    ignore: 'Игнорировать',
    append: 'Добавить',
    saveParameters: 'Сохранить параметры',
    saving: 'Сохранение...',
    settingsSaved: 'Настройки сохранены',
    parametersUpdated: 'Глобальные параметры обновлены.',
    
    // Quick Tasks
    selectedTasks: 'выбранных задач',
    preflightEstimate: 'Предварительная оценка',
    expected: 'Ожидается',
    links: 'ссылок',
    
    // Task Types
    hubPages: 'Хаб-страницы по префиксу',
    moneyPageRouting: 'Маршрутизация денежных страниц',
    similarInSection: 'Похожие в разделе (перекрестные)',
    liftDeepPages: 'Поднять глубинные страницы',
    boostFreshPages: 'Усилить свежие страницы',
    connectOrphanPages: 'Подключить страницы-сироты',
    cleanBrokenLinks: 'Очистить сломанные ссылки',
    regenerateEnrichLinks: 'Пересоздать/обогатить ссылки',
    
    // Task Status
    active: 'Активно',
    topology: 'Топология',
    star: 'Звезда',
    ring: 'Кольцо',
    wheel: 'Колесо',
    restrictPrefix: 'Ограничить строго внутри (под)префикса',
    urlPattern: 'URL шаблон (regex)',
    limitToPrefix: 'Ограничить префиксом (опционально)',
    prefixes: 'Префикс(ы)',
    kNeighbors: 'K соседей',
    mesh: 'Сетка',
    dense: 'Плотная',
    minDepth: 'Мин. глубина',
    donorsFromLevels: 'Доноры с уровней ≤3',
    daysFresh: 'Дней свежести',
    linksPerDonor: 'Ссылок на донора',
    scope: 'Область',
    entireSite: 'Весь сайт',
    specificPrefix: 'Конкретный префикс',
    policy404: 'Политика 404',
    mode: 'Режим',
    enrichExisting: 'Обогатить (добавить к существующим)',
    regenerateAll: 'Пересоздать (заменить все)',
    
    // Launch Progress
    launchGeneration: 'Запустить генерацию',
    tasksSelected: 'задач выбрано для выполнения',
    liveProcessingLog: 'Живой лог обработки',
    linksAdded: 'Ссылок добавлено',
    rejected: 'Отклонено',
    pagesProcessed: 'Страниц обработано',
    elapsedTime: 'Время выполнения',
    generationComplete: 'Генерация завершена',
    generatedCandidates: 'Создано кандидатов ссылок',
    
    // Draft Review
    noDraftCandidates: 'Нет черновых кандидатов. Сначала запустите генерацию.',
    loadingDraftCandidates: 'Загрузка черновых кандидатов...',
    searchUrlsAnchors: 'Поиск по URL или анкорам...',
    exportCsv: 'Экспорт CSV',
    source: 'Источник',
    target: 'Цель',
    anchor: 'Анкор',
    type: 'Тип',
    status: 'Статус',
    actions: 'Действия',
    approved: 'Одобрено',
    pending: 'В ожидании',
    before: 'До',
    after: 'После',
    approveAllVisible: 'Одобрить все видимые',
    clearSelection: 'Снять выделение',
    applyChanges: 'Применить изменения',
    changesApplied: 'Изменения применены',
    candidatesPublished: 'Кандидаты ссылок успешно опубликованы',
    
    // Run History
    noRunsFound: 'Запуски не найдены. Завершите генерацию для просмотра истории.',
    loadingRunHistory: 'Загрузка истории запусков...',
    run: 'Запуск',
    added: 'Добавлено',
    fixed404: '404 исправлено',
    orphansReduced: 'Сирот ↓',
    avgDepthReduced: 'Ср. глубина ↓',
    exact: 'Точный',
    partial: 'Частичный',
    generic: 'Общий',
    processingInProgress: 'Обработка в процессе...',
    clickToViewDetails: 'Нажмите для просмотра деталей',
    loadMoreRuns: 'Загрузить больше запусков',
    
    // Task Names for estimates
    hubs: 'Хабы',
    commerce: 'Коммерция',
    similar: 'Похожие',
    deep: 'Глубинные',
    fresh: 'Свежие',
    orphans: 'Сироты',
    broken: 'Сломанные',
    
    // Footer
    documentation: 'Документация',
    
    // Steps Navigation
    step: 'Шаг',
    of: 'из',
    previousStep: 'Предыдущий шаг',
    nextStep: 'Следующий шаг',
    finish: 'Завершить',
  },
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Navigation
    dashboard: 'Dashboard',
    projects: 'Projects',
    settings: 'Settings',
    logout: 'Logout',
    
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    signInWithGoogle: 'Sign in with Google',
    comingSoon: 'Coming Soon',
    welcomeBack: 'Welcome back!',
    loginSuccess: 'You have been successfully logged in.',
    accountCreated: 'Account created!',
    welcomeTo: 'Welcome to LinkForge.',
    loginFailed: 'Login failed',
    registrationFailed: 'Registration failed',
    invalidCredentials: 'Invalid credentials',
    emailExists: 'Email already exists',
    
    // And so on... (keeping original English for now)
  }
};

export type TranslationKey = keyof typeof translations.ru;

export const t = (key: TranslationKey, lang: 'ru' | 'en' = 'ru'): string => {
  return translations[lang][key] || key;
};