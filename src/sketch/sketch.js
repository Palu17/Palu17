import { CONFIGURAZIONE } from "../configurazione/config.js";
import { GestoreAnimazioni } from "../gestori/GestoreAnimazioni.js";
import { GestoreMappa } from "../gestori/GestoreMappa.js";
import { GestoreSvg } from "../gestori/GestoreSvg.js";

export function createSketch(onDataChange) {
  return (p) => {
    let gestoreMappa;
    let gestoreSvg;
    let gestoreAnimazioni;
    let tabella;
    let caricamentoDatiCompletato = false;
    let lastDataStr = "";

    p.preload = () => {
      try {
        tabella = p.loadTable("/datasetcarceri.csv", "csv", "header");
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
      }
    };

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      inizializzaGestori();
    };

    function inizializzaGestori() {
      try {
        gestoreAnimazioni = new GestoreAnimazioni(p);
        gestoreSvg = new GestoreSvg(p);
        gestoreMappa = new GestoreMappa(gestoreAnimazioni, null, p, gestoreSvg);
        if (tabella) {
          gestoreMappa.caricaDati(tabella);
          caricamentoDatiCompletato = true;
        }
      } catch (error) {
        console.error("Errore nell'inizializzazione dei gestori:", error);
        caricamentoDatiCompletato = false;
      }
    }

    function getDescrizione(regione) {
      if (!gestoreMappa?.tabella) return null;
      const row = gestoreMappa.tabella.rows.find((r) => r.get("regione") === regione);
      return row ? row.get("descrizione") : null;
    }

    function computeData() {
      if (!gestoreMappa) return null;

      const ingrandito = gestoreMappa.gestoreEsagoni?.esagonoIngrandito;
      if (ingrandito) {
        return {
          regione: ingrandito.regione,
          descrizione: getDescrizione(ingrandito.regione),
          carcere: ingrandito.carcere || null,
          sovraffollamento: ingrandito.sovraffollamento,
          persone: ingrandito.persone,
          spazio: ingrandito.spazio,
        };
      }

      if (gestoreMappa.regioneSelezionata) {
        return {
          regione: gestoreMappa.regioneSelezionata,
          descrizione: getDescrizione(gestoreMappa.regioneSelezionata),
        };
      }

      if (gestoreMappa.regioneHover) {
        return {
          regione:
            typeof gestoreMappa.regioneHover === "string"
              ? gestoreMappa.regioneHover
              : gestoreMappa.regioneHover.regione,
        };
      }

      return null;
    }

    p.draw = () => {
      if (!caricamentoDatiCompletato) return;

      p.background(CONFIGURAZIONE.colori.sfondo);
      gestoreMappa?.aggiorna();
      gestoreMappa?.disegna();

      const ingrandito = gestoreMappa?.gestoreEsagoni?.esagonoIngrandito;
      if (ingrandito) {
        gestoreSvg?.visualizza(ingrandito);
        gestoreMappa?.gestoreEsagoni?.aggiornaIngrandimento();
      }

      const newData = computeData();
      const newStr = JSON.stringify(newData);
      if (newStr !== lastDataStr) {
        lastDataStr = newStr;
        onDataChange?.(newData);
      }
    };

    p.mousePressed = () => {
      if (!caricamentoDatiCompletato) return;
      gestoreMappa?.gestisciClick(p.mouseX, p.mouseY);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      gestoreMappa?.ridimensiona(p.windowWidth, p.windowHeight);
      gestoreSvg?.ridimensiona(p.windowWidth, p.windowHeight);
    };

    p.touchStarted = () => {
      if (p.touches?.length > 0) {
        p.mouseX = p.touches[0].x;
        p.mouseY = p.touches[0].y;
      }
      p.mousePressed();
      return false;
    };

    p.touchMoved = () => {
      if (p.touches?.length > 0) {
        p.mouseX = p.touches[0].x;
        p.mouseY = p.touches[0].y;
      }
      return false;
    };

    p.touchEnded = () => false;
  };
}
