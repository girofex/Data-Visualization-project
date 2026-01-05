export function showMobilePopup() {
    if (window.innerWidth > 768 || sessionStorage.getItem('mobilePopupShown'))
        return;

    fetch('components/popup.html')
        .then(response => response.text())
        .then(html => {
            const popupContainer = document.createElement('div');
            popupContainer.innerHTML = html;
            document.body.appendChild(popupContainer.firstElementChild);

            document.getElementById('popup-close').addEventListener('click', () => {
                const popup = document.getElementById('mobile-popup');
                popup.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    popup.remove();
                    sessionStorage.setItem('mobilePopupShown', 'true');
                }, 300);
            });
        })
        .catch(err => console.error('Failed to load popup:', err));
}