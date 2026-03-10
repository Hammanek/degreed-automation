// --- Začátek kódu pro vložení do konzole ---

// Úložiště pro unikátní odkazy, které zůstane zachováno mezi voláními funkcí.
let uniqueCollectedLinks = new Set();

/**
 * Funkce, která projde stránku, najde všechny odkazy (<a> tagy),
 * vyfiltruje pouze ty, které obsahují "eu.degreed",
 * a přidá jejich 'href' atribut do setu unikátních odkazů.
 */
function collectLinks() {
  // Najdeme všechny <a> elementy na stránce
  const allLinksOnPage = document.querySelectorAll('a');
  let newLinksFound = 0;

  // Projdeme všechny nalezené elementy
  allLinksOnPage.forEach(link => {
    // Podmínka: odkaz musí mít 'href' atribut A ZÁROVEŇ musí obsahovat "eu.degreed"
    if (link.href && link.href.includes('eu.degreed')) {
      // Pokud odkaz ještě není v setu, přičteme ho do počítadla nových
      if (!uniqueCollectedLinks.has(link.href)) {
        newLinksFound++;
      }
      // Přidáme plnou URL adresu do našeho Setu. Duplicity jsou ignorovány.
      uniqueCollectedLinks.add(link.href);
    }
  });

  // Vypíšeme do konzole informaci o aktuálním stavu
  console.log(`Nalezeno ${newLinksFound} nových odkazů. Celkem nasbíráno unikátních odkazů: ${uniqueCollectedLinks.size}`);
}

/**
 * Funkce pro vypsání všech nasbíraných unikátních odkazů do konzole, každý na samostatný řádek.
 */
function showCollectedLinks() {
  if (uniqueCollectedLinks.size === 0) {
    console.log("Zatím nebyly nasbírány žádné odkazy splňující kritéria. Spusťte nejprve funkci collectLinks().");
    return;
  }

  // Převedeme Set na pole
  const linksArray = Array.from(uniqueCollectedLinks);

  console.log("--- Seznam všech nasbíraných unikátních odkazů (každý na řádek) ---");
  // Vypíšeme pole pro snadnou inspekci v konzoli
  console.log(linksArray);

  console.log("\n--- Odkazy pro kopírování do url.txt (každý na řádek) ---");
  // Vypíšeme každý odkaz na samostatný řádek
  linksArray.forEach(link => {
    console.log(link);
  });

  console.log("\n📋 Celkem odkazů: " + linksArray.length);
}

/**
 * Funkce pro vymazání seznamu nasbíraných odkazů.
 */
function clearLinks() {
    uniqueCollectedLinks.clear();
    console.log("Seznam nasbíraných odkazů byl vymazán.");
}

console.log("Skript připraven. Nyní můžete používat funkce: collectLinks(), showCollectedLinks() a clearLinks(). Skript bude sbírat pouze odkazy obsahující 'eu.degreed'.");

// --- Konec kódu ---
