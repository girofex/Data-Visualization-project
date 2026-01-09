function responsiveRedirect() {
    const isMobile = window.innerWidth <= 739;
    const path = window.location.pathname;
    const isOnMobilePage = path.includes('popup.html');
    
    const lastRedirect = sessionStorage.getItem('lastRedirectTime');
    const now = Date.now();
    
    if (lastRedirect && (now - lastRedirect) < 1000)
        return;

    if (isMobile && !isOnMobilePage) {
        sessionStorage.setItem('desktopPageBeforeMobile', window.location.href);
        sessionStorage.setItem('lastRedirectTime', now);
        window.location.replace('./components/popup.html');
    }

    if (!isMobile && isOnMobilePage) {
        const previousPage = sessionStorage.getItem('desktopPageBeforeMobile');
        sessionStorage.setItem('lastRedirectTime', now);
        window.location.replace(previousPage || './index.html');
    }
}

responsiveRedirect();

window.matchMedia('(max-width: 766px)').addEventListener('change', responsiveRedirect);