export function showMobilePopup() {
    if (window.innerWidth < 768 && !sessionStorage.getItem('mobilePopupShown')) {
        const popupHTML = `
            <div id="mobile-popup" class="mobile-popup-overlay">
                <div class="mobile-popup-content">
                    <h3>Notice</h3>
                    <p>For the best experience, we recommend viewing this site on a larger screen
                        or eventually visualizing with desktop view.</p>
                    <button id="mobile-popup-close" class="mobile-popup-button">Continue anyway</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);

        const popup = document.getElementById('mobile-popup');
        const closeButton = document.getElementById('mobile-popup-close');

        closeButton.addEventListener('click', closePopup);
        popup.addEventListener('click', (e) => {
            if (e.target === popup)
                closePopup();
        });

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        function closePopup() {
            popup.style.animation = 'mobilePopupFadeOut 0.3s ease';

            setTimeout(() => {
                popup.remove();
                sessionStorage.setItem('mobilePopupShown', 'true');
            }, 300);
        }

        document.body.style.overflow = 'hidden';

        const originalClose = closePopup;

        closePopup = function () {
            document.body.style.overflow = '';
            originalClose();
            document.body.style.overflow = 'show';
        };
    }
}