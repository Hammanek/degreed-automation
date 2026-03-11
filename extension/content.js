(function() {
    'use strict';

    const hostname = window.location.hostname;

    // --- AUTO CLOSE LOGIC ---
    if (hostname.includes('login.microsoftonline.com') || 
        hostname.includes('stso.skoda.vwgroup.com') ||
        hostname.includes('youtube.com') ||
        hostname.includes('youtu.be') ||
        hostname.includes('lms.skoda.vwgroup.com') ||
        hostname.includes('digiskills.cz') ||
        hostname.includes('consent.youtube.com')) {
        console.log("🔒 Detekováno přihlašovací okno nebo LMS, zavírám okamžitě...");
        window.close();
        return;
    }

    // --- DEGREED AUTOMATION LOGIC ---
    if (hostname.includes('eu.degreed.com')) {
        // Automatické zavření po úspěšném přihlášení
        if (window.location.pathname.includes('/home/overview')) {
            console.log('✅ Úspěšné přihlášení detekováno, zavírám tab za 2s...');
            setTimeout(() => {
                window.close();
            }, 2000);
            return;
        }

        const CONFIG = {
            checkDelay: 2000,
            maxWaitForNewWindow: 10000,
            waitAfterOpen: 3000
        };

        let currentState = 'init';
        let timeoutId = null;

        function initDegreedAutomation() {
            console.log('🚀 Degreed Automation Extension started');

            if (isAlreadyCompleted()) {
                console.log('✅ Content již je dokončený, zavírám okno');
                setTimeout(() => window.close(), 1000);
                return;
            }

            if (isMainWindow()) {
                currentState = 'main_window';
                handleMainWindow();
            } else if (isLearningWindow()) {
                currentState = 'learning_window';
                handleLearningWindow();
            } else {
                console.log('🔍 Čekám na načtení stránky...');
                setTimeout(initDegreedAutomation, CONFIG.checkDelay);
            }
        }

        function isAlreadyCompleted() {
            const completionSlides = document.querySelectorAll('.input-completion__slide, div[class*="completion__slide"]');
            for (let slide of completionSlides) {
                const text = slide.textContent.trim();
                if (text.includes('Dokončeno')) return true;
            }
            return false;
        }

        function isMainWindow() {
            return findOpenButton() !== null;
        }

        function isLearningWindow() {
            return document.querySelector('[data-dgat*="learning-resource-metadata-minutes-"]') || findCompleteButton() !== null;
        }

        function handleMainWindow() {
            if (isAlreadyCompleted()) {
                setTimeout(() => window.close(), 1000);
                return;
            }
            const openButton = findOpenButton();
            if (openButton) {
                openButton.click();
                setTimeout(handleLearningWindow, CONFIG.waitAfterOpen);
            }
        }

        function handleLearningWindow() {
            if (isAlreadyCompleted()) {
                setTimeout(() => window.close(), 1000);
                return;
            }
            
            // Kontrola, jestli existuje tlačítko Dokončit
            const completeButton = findCompleteButton();
            if (!completeButton) {
                console.log('❌ Tlačítko Dokončit nenalezeno, zavírám okno');
                setTimeout(() => window.close(), 1000);
                return;
            }
            
            const minutes = getContentMinutes() || 1;
            console.log(`⏰ Délka contentu: ${minutes} minut`);
            waitAndComplete(minutes);
        }

        function getContentMinutes() {
            const timeElement = document.querySelector('[data-dgat*="learning-resource-metadata-minutes-"]');
            if (timeElement) {
                const match = timeElement.textContent.match(/(\d+)\s*min/);
                if (match) return parseInt(match[1]);
            }
            return null;
        }

        function waitAndComplete(minutes) {
            const waitTimeSeconds = minutes * 60;
            const startTime = Date.now();
            const endTime = startTime + (waitTimeSeconds * 1000);
            
            const skipBtn = addSkipButton();
            
            const updateUI = () => {
                const now = Date.now();
                const remainingRaw = Math.max(0, Math.ceil((endTime - now) / 1000));
                
                const mins = Math.floor(remainingRaw / 60);
                const secs = remainingRaw % 60;
                const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
                
                skipBtn.innerHTML = `⏭️ Přeskočit čekání (zbývá ${formatted})`;

                // Poslat informaci do hlavního okna
                if (window.opener) {
                    // Vyzvat background k focusu na hlavní tab (DEAKTIVOVÁNO na žádost uživatele)
                    /*
                    if (remainingRaw % 3 === 0) {
                        try { chrome.runtime.sendMessage({ action: 'FOCUS_MAIN_TAB' }); } catch(e) {}
                    }
                    */

                    window.opener.postMessage({
                        type: 'degreed_countdown',
                        remainingSeconds: remainingRaw,
                        formattedTime: formatted
                    }, '*');
                }

                return remainingRaw;
            };
            
            updateUI();
            
            const intervalId = setInterval(() => {
                const remaining = updateUI();
                if (remaining <= 0) {
                    clearInterval(intervalId);
                    completeLearning();
                }
            }, 1000);

            // Pojistka pro dokončení (pokud interval selže)
            timeoutId = setTimeout(() => {
                clearInterval(intervalId);
                completeLearning();
            }, (waitTimeSeconds + 5) * 1000);
        }

        function completeLearning() {
            const completeButton = findCompleteButton();
            if (completeButton) {
                if (completeButton.hidden || completeButton.style.display === 'none') {
                    completeButton.hidden = false;
                    completeButton.style.display = 'block';
                }
                completeButton.click();
                setTimeout(() => window.close(), 3000);
            } else {
                window.close();
            }
        }

        function findOpenButton() {
            const buttons = document.querySelectorAll('button.action-button, button[class*="action-button"]');
            for (let button of buttons) {
                const text = (button.textContent || '').toLowerCase();
                const aria = (button.getAttribute('aria-label') || '').toLowerCase();
                if (text.includes('open') || text.includes('otevřít') || aria.includes('open') || aria.includes('otevřít')) return button;
            }
            return null;
        }

        function findCompleteButton() {
            const slides = document.querySelectorAll('.input-completion__slide, div[class*="completion__slide"]');
            for (let slide of slides) {
                const text = slide.textContent.trim();
                if (text.includes('Označit jako dokončené') || text.includes('dokončené')) return slide;
            }
            return null;
        }

        function addSkipButton() {
            let btn = document.getElementById('degreed-skip-btn');
            if (btn) return btn;
            
            btn = document.createElement('button');
            btn.id = 'degreed-skip-btn';
            btn.innerHTML = '⏭️ Přeskočit čekání';
            btn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999;padding:12px 20px;background:#ff4444;color:white;border:none;border-radius:8px;cursor:pointer;font-family:sans-serif;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:transform 0.2s;';
            btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
            btn.onmouseout = () => btn.style.transform = 'scale(1)';
            btn.onclick = function() {
                if (timeoutId) clearTimeout(timeoutId);
                completeLearning();
            };
            document.body.appendChild(btn);
            return btn;
        }

        setTimeout(initDegreedAutomation, 3000);
    }
})();
