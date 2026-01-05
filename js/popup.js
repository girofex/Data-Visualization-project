export function showMobilePopup() {
    const checkAndShowPopup = () => {
        if (window.innerWidth <= 938) {
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

            function closePopup() {
                popup.style.animation = 'mobilePopupFadeOut 0.3s ease';
                document.body.style.overflow = '';

                setTimeout(() => {
                    popup.remove();
                }, 300);
            }

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
            document.body.style.overflow = 'hidden';
        }
    };

    setTimeout(checkAndShowPopup, 100);
}