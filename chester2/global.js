(() => {
  const LANGUAGE_KEY = 'preferredLanguage';
  const toggleButton = document.querySelector('[data-lang-toggle]');
  const translatableElements = Array.from(document.querySelectorAll('[data-tr]'));
  const placeholderElements = Array.from(document.querySelectorAll('[data-tr-placeholder]'));

  const sanitizeTitle = (title) =>
    title.replace(/[<>]/g, '').replace(/[\u0000-\u001F\u007F]/g, '').trim();

  const getPageTitle = () => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    let title = 'index';
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      if (lastSegment.toLowerCase() === 'index.html') {
        title = segments.length > 1 ? segments[segments.length - 2] : 'index';
      } else if (lastSegment.endsWith('.html')) {
        title = lastSegment.slice(0, -5);
      } else {
        title = lastSegment;
      }
    }
    const sanitized = sanitizeTitle(title);
    return sanitized || 'index';
  };

  const normalizeLanguage = (language) => (language === 'tr' ? 'tr' : 'en');

  const readStoredLanguage = () => {
    try {
      return localStorage.getItem(LANGUAGE_KEY);
    } catch (error) {
      return null;
    }
  };

  const storeLanguage = (language) => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      return;
    }
  };

  const sanitizeTranslation = (html) => {
    if (!html) {
      return '';
    }
    const template = document.createElement('template');
    template.innerHTML = html;
    const allowedTags = new Set(['BR', 'SPAN']);
    const nodes = Array.from(template.content.querySelectorAll('*'));

    nodes.forEach((node) => {
      if (!allowedTags.has(node.tagName)) {
        node.replaceWith(document.createTextNode(node.textContent || ''));
        return;
      }

      Array.from(node.attributes).forEach((attr) => {
        if (node.tagName === 'SPAN' && attr.name === 'class' && attr.value === 'text-red') {
          return;
        }
        node.removeAttribute(attr.name);
      });
    });

    const wrapper = document.createElement('div');
    wrapper.appendChild(template.content.cloneNode(true));
    return wrapper.innerHTML;
  };

  const applyLanguage = (language) => {
    const normalized = normalizeLanguage(language);
    document.documentElement.setAttribute('lang', normalized);

    translatableElements.forEach((element) => {
      if (!element.dataset.en) {
        element.dataset.en = element.innerHTML;
      }
      const translation = normalized === 'tr' ? element.dataset.tr : element.dataset.en;
      element.innerHTML = sanitizeTranslation(translation);
    });

    placeholderElements.forEach((element) => {
      if (!element.dataset.enPlaceholder) {
        element.dataset.enPlaceholder = element.getAttribute('placeholder') || '';
      }
      element.setAttribute(
        'placeholder',
        normalized === 'tr' ? element.dataset.trPlaceholder : element.dataset.enPlaceholder
      );
    });

    if (toggleButton) {
      toggleButton.textContent = normalized === 'tr' ? 'EN' : 'TR';
      toggleButton.setAttribute(
        'aria-label',
        normalized === 'tr' ? 'Switch to English' : 'Türkçeye geç'
      );
    }

    storeLanguage(normalized);
  };

  document.title = getPageTitle();

  const storedLanguage = readStoredLanguage();
  applyLanguage(storedLanguage || 'en');

  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('lang');
      applyLanguage(current === 'tr' ? 'en' : 'tr');
    });
  }
})();
