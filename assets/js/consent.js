function hideBanner() {
document.getElementById('cookie-consent-banner').style.display = 'none';
}

if(localStorage.getItem('consentMode') === null) {

document.getElementById('btn-accept').addEventListener('click', function() {
    setConsent({
    analytics: true,
    });
    hideBanner();
});
document.getElementById('cookie-consent-banner').style.display = 'block';
}

function setConsent(consent) {
const consentMode = {
    'functionality_storage': consent.necessary ? 'granted' : 'denied',
    'security_storage': consent.necessary ? 'granted' : 'denied',
    'ad_storage': consent.marketing ? 'granted' : 'denied',
    'analytics_storage': consent.analytics ? 'granted' : 'denied',
    'personalization': consent.preferences ? 'granted' : 'denied',
};
gtag('consent', 'update', consent);  
localStorage.setItem('consentMode', JSON.stringify(consentMode));
}