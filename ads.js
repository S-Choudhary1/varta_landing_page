// Google AdSense Integration - Simple responsive handling
document.addEventListener('DOMContentLoaded', () => {
    // Handle responsive ad visibility
    function handleAdResize() {
        const isMobile = window.innerWidth <= 768;
        
        // Show/hide appropriate ads based on screen size
        const desktopAds = document.querySelectorAll('.desktop-only');
        const mobileAds = document.querySelectorAll('.mobile-only');
        
        desktopAds.forEach(ad => {
            ad.style.display = isMobile ? 'none' : 'block';
        });
        
        mobileAds.forEach(ad => {
            ad.style.display = isMobile ? 'block' : 'none';
        });
    }
    
    // Initial setup
    handleAdResize();
    
    // Handle window resize for responsive ads
    window.addEventListener('resize', handleAdResize);
    
    console.log('AdSense integration initialized');
}); 