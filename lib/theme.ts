/**
 * Inline script that runs before paint so the stored (or system) theme
 * applies without a flash. Same key as ShiftCitizen (`sc-theme`).
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('sc-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else{document.documentElement.setAttribute('data-theme',window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}}catch(e){}})();`;

export const THEME_KEY = 'sc-theme';
