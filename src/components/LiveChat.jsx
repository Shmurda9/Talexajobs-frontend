import React, { useEffect } from 'react';

function LiveChat() {
  useEffect(() => {
    // Prevent multiple widget loads
    if (document.getElementById('tawk-script')) return;

    var Tawk_API = window.Tawk_API || {};
    var Tawk_LoadStart = new Date();
    
    // 🚨 THE FIX: Wait for the widget to load, THEN set the user's actual identity
    Tawk_API.onLoad = function() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          window.Tawk_API.setAttributes({
            'name': user.fullName || 'Registered User',
            'email': user.email || ''
          }, function (error) {
            if (error) console.error("Tawk.to attribute error:", error);
          });
        } catch (e) {
          console.error("Could not parse user for live chat.");
        }
      }
    };

    // Attach API to window so the script can see our settings
    window.Tawk_API = Tawk_API;

    var s1 = document.createElement("script");
    var s0 = document.getElementsByTagName("script")[0];
    
    s1.async = true;
    s1.id = 'tawk-script'; // Tag it so we don't load it twice
    s1.src = 'https://embed.tawk.to/69ce5ceee360ca1c3ce2f2af/1jl71m10f'; 
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }
  }, []);

  return null; 
}

export default LiveChat;