# 🎓 Degreed Automation

> [!IMPORTANT]
> **UPOZORNĚNÍ:** Tento nástroj slouží výhradně pro EDUKATIVNÍ ÚČELY a k testování automatizačních procesů v prohlížeči. Neslouží k obcházení povinných školení ani k porušování vnitřních předpisů. Použití je na vlastní zodpovědnost.

Tento projekt poskytuje jednoduché rozhraní pro automatizované otevírání a správu odkazů na platformě Degreed. Automatické dokončování vzdělávacích kurzů na platformě **eu.degreed.com**.

---

## ✨ Hlavní funkce

- 🚀 **One-Click Launch** - Spuštění automatizace jediným souborem `START.bat`.
- 🛠️ **Bez instalace** - Nemusíte nic instalovat do systému (izolované Chromium).
- ⏱️ **Živý odpočet** - Vteřinový odpočet času přímo v panelu.
- 📊 **Přehledné rozhraní** - Webový panel pro sledování postupu.
- ⏭️ **Možnost přeskočení** - Tlačítko pro okamžité dokončení kurzu.

---

## 🚀 Rychlý start

1.  **Vložte odkazy**: Otevřete soubor `url.txt` a vložte do něj odkazy na kurzy (jeden odkaz na řádek).
2.  **Spusťte `START.bat`**: Dvojklikem spusťte aplikaci. Otevře se okno prohlížeče s ovládacím panelem.
3.  **Přihlášení (DŮLEŽITÉ)**: Než spustíte běh, otevřete si v tomto prohlížeči **novou záložku**, jděte na `eu.degreed.com` a přihlaste se (SSO). Poté záložku zavřete.
4.  **Start**: Vraťte se do ovládacího panelu a klikněte na **"🚀 Spustit automatizaci"**.

---

## 💡 Tipy pro efektivitu

- **Minimalizace**: Okno můžete v klidu minimalizovat na lištu. Automatizace i odpočet běží spolehlivě dál na pozadí a okno na vás nebude samo vyskakovat.
- **Rychlejší postup**: Pokud chcete přejít na další kurz dříve, stačí ručně zavřít okno s kurzem nebo kliknout na **"⏭️ Přeskočit čekání"** přímo na stránce kurzu.
- **Reset dat**: Pro smazání historie a přihlášení stačí smazat složku `browser_profile`.

---

## 🌟 Vlastnosti

- **Bilingvální podpora**: Plně kompatibilní s **českou i anglickou** verzí rozhraní Degreed.
- **Auto-Close**: Automaticky zavírá přihlašovací okna Microsoftu a odkazy na **YouTube** (po 1 sekundě), aby nezůstávaly viset v prohlížeči.

---

## 🔧 Řešení problémů

| Problém | Možné řešení |
| :--- | :--- |
| **"Nenalezeny odkazy"** | Zkontrolujte, zda `url.txt` obsahuje platné URL adresy na degreed.com. |
| **Kurzy se neotevírají** | Povolte vyskakovací okna (Pop-ups) v horní liště prohlížeče. |
| **Chyba stahování** | Zkontrolujte internetové připojení. Skript stahuje cca 150 MB (Chromium). |

---

## 📝 Poznámky k bezpečnosti

Veškerá data jsou uložena **pouze lokálně** ve složce `browser_profile`. Projekt po smazání složky nezanechává v systému žádné stopy.
