let links = [];
let currentIndex = 0;
let isRunning = false;
let currentWindow = null;
let timeoutId = null;
let countdownInterval = null;
let remainingSeconds = 0;
const SETTINGS_KEY = 'degreed_automation_settings';
const SAVE_KEY = 'degreed_automation_progress';

// Přijímání zpráv z otevřeného okna (živý odpočet)
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'degreed_countdown') {
        const time = event.data.formattedTime;
        const countdownWrap = document.getElementById('liveCountdownWrap');
        const countdownTime = document.getElementById('liveCountdownTime');

        if (countdownWrap && countdownTime) {
            countdownWrap.style.display = 'inline';
            countdownTime.textContent = time;

            // Dynamický název okna pro lepší přehled v tabech
            document.title = `(${time}) Degreed Automatizace`;
        }

        // Parent focus fix: Pokud okno nemá focus, zkusíme ho vyvolat
        if (isRunning && !document.hasFocus()) {

        }
    }
});
let maxWaitMinutes = 65;


function setFileInfo(message, type = 'info') {
    const info = document.getElementById('fileInfo');
    if (!info) return;

    info.textContent = message;

    if (type === 'error') {
        info.style.color = '#E30613';
    } else if (type === 'warning') {
        info.style.color = '#FFCC00';
    } else if (type === 'success') {
        info.style.color = '#00843D';
    } else {
        info.style.color = '#666';
    }
}

function showManualInput(show) {
    const manual = document.getElementById('manualInput');
    if (!manual) return;
    manual.style.display = show ? 'block' : 'none';
}

function normalizeLinks(text) {
    return text
        .split(/\r?\n/)
        .map(link => link.trim())
        .filter(link => link.startsWith('http') && link.includes('degreed.com'))
        .filter(link => link.length > 0);
}

async function loadLinksFromLinksTxt() {
    const response = await fetch('url.txt', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    processLinks(text, 'url.txt');
}

function loadLinksFromFilePicker() {
    return new Promise((resolve, reject) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';
        fileInput.style.display = 'none';

        fileInput.onchange = function (event) {
            const file = event.target.files[0];
            if (!file) {
                reject(new Error('Soubor nebyl vybrán'));
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                processLinks(text, file.name);
                resolve();
            };
            reader.onerror = function () {
                reject(new Error('Chyba při čtení souboru'));
            };
            reader.readAsText(file);
        };

        fileInput.click();
    });
}

// Načtení odkazů při startu stránky
async function loadLinks() {
    console.log('Načítám odkazy z url.txt...');
    setFileInfo('Načítám odkazy z url.txt...');
    showManualInput(false);

    try {
        await loadLinksFromLinksTxt();
    } catch (error) {
        console.log('Nelze načíst url.txt, vyžaduji výběr souboru uživatelem');
        setFileInfo('Soubor url.txt nelze načíst. Vyber soubor ručně.', 'warning');
        showManualInput(false);
        addLog('Soubor url.txt není dostupný. Vyber soubor ručně.', 'warning');
    }
}

// Ruční výběr souboru (tlačítko "Načíst odkazy")
async function loadLinksFile() {
    console.log('Otevírám výběr souboru...');
    setFileInfo('Vyber soubor s odkazy...', 'info');
    showManualInput(false);

    try {
        await loadLinksFromFilePicker();
    } catch (error) {
        console.log('Výběr souboru byl zrušen nebo selhal');
        setFileInfo('Soubor nebyl načten. Zkus to znovu.', 'error');
        addLog('Soubor nebyl načten.', 'error');
    }
}

// Zpracování textu s odkazy
function processLinks(text, sourceLabel = 'soubor') {
    console.log('Zpracovávám text, délka:', text.length);

    links = normalizeLinks(text);

    console.log('Nalezeno odkazů:', links.length);

    if (links.length > 0) {
        console.log('Prvních 5 odkazů:', links.slice(0, 5));
        updateUI();
        setFileInfo(`Načteno ${links.length} odkazů ze souboru ${sourceLabel}`, 'success');
    } else {
        console.log('Žádné platné odkazy nenalezeny');
        updateUI();
        setFileInfo(`Soubor ${sourceLabel} neobsahuje platné odkazy`, 'error');
        addLog('Žádné platné odkazy nenalezeny.', 'error');
    }
}

// Aktualizace UI
function updateUI() {
    const totalLinks = links.length;

    // Použij nové UI funkce
    if (typeof updateUIStats === 'function') {
        updateUIStats(totalLinks);
    }

    if (links.length > 0) {
        addLog(`Načteno ${links.length} odkazů`, 'success');
    }
    loadSettings();
}

function loadSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
        const settings = JSON.parse(saved);
        if (settings.waitTime) {
            maxWaitMinutes = settings.waitTime;
            const input = document.getElementById('waitTimeInput');
            if (input) input.value = maxWaitMinutes;
            const display = document.getElementById('currentWaitDisplay');
            if (display) display.textContent = maxWaitMinutes;
            addLog(`Načteno nastavení: čekání ${maxWaitMinutes} minut`, 'info');
        }
    }
}

function updateWaitTime(minutes) {
    maxWaitMinutes = parseInt(minutes) || 65;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ waitTime: maxWaitMinutes }));

    const display = document.getElementById('currentWaitDisplay');
    if (display) display.textContent = maxWaitMinutes;

    addLog(`Nastaveno čekání na ${maxWaitMinutes} minut`, 'info');
}


function startAutomation() {
    if (links.length === 0) {
        alert('Nejsou načteny žádné odkazy. Zkontroluj soubor url.txt nebo vyber soubor ručně.');
        return;
    }

    /* 
    const shouldStart = confirm(
        `Spustit automatizaci pro ${links.length} kurzů?\n\n` +
        `Můžeš kdykoli okno ručně zavřít pro okamžité pokračování.`
    );

    if (!shouldStart) {
        addLog('Automatizace zrušena uživatelem', 'warning');
        return;
    }
    */

    isRunning = true;
    currentIndex = 0;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;

    // Zobraz progress sekci
    if (typeof showProgressSection === 'function') {
        showProgressSection(true);
    } else {
        document.getElementById('progressSection').classList.add('active');
    }

    addLog('Spouštím automatizaci...', 'success');
    openNextLink();
}


function stopAutomation(needConfirm = true) {
    if (needConfirm && !confirm('Opravdu chceš zastavit automatizaci?')) {
        return;
    }

    isRunning = false;

    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }

    if (currentWindow && !currentWindow.closed) {
        currentWindow.close();
    }

    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;

    document.getElementById('currentStepInfo').innerHTML = '<i class="fas fa-tasks"></i> Automatizace zastavena';
    document.getElementById('currentLink').innerHTML = '<i class="fas fa-link"></i> ---';

    addLog('Automatizace zastavena', 'warning');
}

function openNextLink() {
    if (!isRunning) return;

    // Zruší předchozí timeout
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }

    if (currentIndex >= links.length) {
        addLog('Všechny kurzy byly zpracovány!', 'success');
        isRunning = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('currentStepInfo').innerHTML = '<i class="fas fa-check-circle"></i> Vše dokončeno';
        document.getElementById('currentLink').innerHTML = '<i class="fas fa-link"></i> ---';
        return;
    }

    const link = links[currentIndex];

    // Aktualizuj progress
    if (typeof updateProgress === 'function') {
        updateProgress(currentIndex, links.length, true);
    } else {
        const progress = (currentIndex / links.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${currentIndex} / ${links.length}`;
    }

    // Aktualizuj link
    if (typeof updateCurrentLink === 'function') {
        updateCurrentLink(link);
    }

    addLog(`Otevírám kurz ${currentIndex + 1}/${links.length}`, 'success');

    // Otevře odkaz v novém okně
    currentWindow = window.open(link, '_blank');

    if (!currentWindow) {
        addLog('Nepodařilo se otevřít okno. Povol pop-up okna!', 'error');
        stopAutomation(false);
        return;
    }

    // Focus nyní řeší výhradně background script rozšíření, 
    // aby nedocházelo k nechtěnému otevírání z minimalizace.

    // Resetujeme zobrazení živého odpočtu
    const countdownWrap = document.getElementById('liveCountdownWrap');
    if (countdownWrap) countdownWrap.style.display = 'none';
    document.title = 'Degreed Automatizace';

    currentIndex++;

    // Kontrola každou sekundu, jestli uživatel okno ručně nezavřel
    const checkInterval = setInterval(() => {
        if (currentWindow && currentWindow.closed) {
            clearInterval(checkInterval);
            addLog('Kurz dokončen/zavřen, pokračuji na další...', 'warning');
            proceedToNext();
        }
    }, 1000);

    // Timeout jako pojistka pro případ, že okno zůstane viset (např. nastavených X min)
    const maxWaitMs = maxWaitMinutes * 60 * 1000;

    timeoutId = setTimeout(() => {
        clearInterval(checkInterval);

        if (currentWindow && !currentWindow.closed) {
            currentWindow.close();
            addLog('Automaticky zavírám okno po vypršení limitu', 'warning');
        }

        proceedToNext();
    }, maxWaitMs);
}

function proceedToNext() {
    if (!isRunning) return;

    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }

    if (currentIndex < links.length) {
        addLog('Připravuji další kurz...', 'success');
        setTimeout(openNextLink, 2000); // 2 sekundy pauza mezi kurzy
    } else {
        addLog('Všechny kurzy dokončeny!', 'success');
        isRunning = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    }
}

function addLog(message, type = '') {
    // Použij novou UI funkci pokud existuje
    if (typeof addLogEntry === 'function') {
        addLogEntry(message, type);
        return;
    }

    // Fallback pro staré UI
    const logDiv = document.getElementById('log');
    if (!logDiv) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;

    const time = new Date().toLocaleTimeString('cs-CZ');
    entry.textContent = `[${time}] ${message}`;

    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Načtení odkazů při startu stránky
setTimeout(loadLinks, 500);
