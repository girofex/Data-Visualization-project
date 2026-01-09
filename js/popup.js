function responsiveRedirect() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const path = window.location.pathname;
    const isOnMobilePage = path.includes('popup.html');
    
    const lastRedirect = sessionStorage.getItem('lastRedirectTime');
    const now = Date.now();
    
    if (lastRedirect && (now - lastRedirect) < 1000)
        return;

    if (isPortrait && !isOnMobilePage) {
        sessionStorage.setItem('desktopPageBeforeMobile', window.location.href);
        sessionStorage.setItem('lastRedirectTime', now);
        window.location.replace('./components/popup.html');
    }

    if (!isPortrait && isOnMobilePage) {
        const previousPage = sessionStorage.getItem('desktopPageBeforeMobile');
        sessionStorage.setItem('lastRedirectTime', now);
        window.location.replace(previousPage || './index.html');
    }
}

responsiveRedirect();

window.matchMedia('(orientation: portrait)').addEventListener('change', responsiveRedirect);