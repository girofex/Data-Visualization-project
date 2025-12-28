function GoTop() {
    const start = window.pageYOffset;
    const duration = 600;
    const startTime = performance.now();

    function scroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = 1 - Math.pow(1 - progress, 3);

        window.scrollTo(0, start * (1 - ease));

        if (progress < 1)
            requestAnimationFrame(scroll);
    }

    requestAnimationFrame(scroll);
}