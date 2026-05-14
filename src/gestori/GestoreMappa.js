import { CONFIGURAZIONE } from "../configurazione/config.js";
import { Esagono } from "../modelli/Esagono.js";
import { GestoreEsagoni } from "./GestoreEsagoni.js";
import { GestoreTesto } from "./GestoreTesto.js";

const StatoMappa = {
  ITALIA: "ITALIA",
  REGIONE: "REGIONE",
  CELLA: "CELLA",
};

export class GestoreMappa {
  constructor(gestoreAnimazioni, legenda, p, gestoreSvg) {
    this.p = p;
    this.gestoreSvg = gestoreSvg;
    this.esagoni = [];
    this.regioneHover = null;
    this.cellaHover = null;
    this.regioneSelezionata = null;
    this.italiaRimpicciolita = false;
    this.stato = StatoMappa.ITALIA;
    this.gestoreEsagoni = new GestoreEsagoni(this, p);
    this.gestoreTesto = new GestoreTesto(gestoreAnimazioni, p);
    this.CONFIG = CONFIGURAZIONE;
    this.esagonoCliccato = null;
    this.hoverAttivo = true;
    this.fadeInProgress = 0;
    this._cache = {
      esagoniPerRegione: new Map(),
      centroRegioni: new Map(),
      dimensioniMappa: null,
    };
    this.tabella = null;
  }

  caricaDati(tabella) {
    this.tabella = tabella;
    this._cache.dimensioniMappa = this._calcolaDimensioniMappa(tabella);
    const { minX, maxX, minY, maxY, scaleFactor, offsetX, offsetY, raggio } =
      this._cache.dimensioniMappa;

    const sovraffollamenti = tabella.getColumn("sovraffollamento").map(Number);
    const maxSovraffollamento = Math.max(...sovraffollamenti);
    const minSovraffollamento = Math.min(...sovraffollamenti);

    let contatoreRegioni = new Map();

    for (let riga of tabella.rows) {
      const esagono = this._creaEsagono(riga, {
        minX,
        maxX,
        minY,
        maxY,
        offsetX,
        offsetY,
        scaleFactor,
        raggio,
        minSovraffollamento,
        maxSovraffollamento,
        contatoreRegioni,
      });

      this.esagoni.push(esagono);

      if (!this._cache.esagoniPerRegione.has(esagono.regione)) {
        this._cache.esagoniPerRegione.set(esagono.regione, []);
      }
      this._cache.esagoniPerRegione.get(esagono.regione).push(esagono);
    }

    this._calcolaCentriRegioni();

    this.gestoreTesto.setEsagoni(this.esagoni);
  }

  _calcolaDimensioniMappa(tabella) {
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    for (let riga of tabella.rows) {
      let x = parseFloat(riga.get("x").replace(",", "."));
      let y = parseFloat(riga.get("y").replace(",", "."));
      minX = this.p.min(minX, x);
      maxX = this.p.max(maxX, x);
      minY = this.p.min(minY, y);
      maxY = this.p.max(maxY, y);
    }

    let mappaWidth = maxX - minX;
    let mappaHeight = maxY - minY;
    let aspectRatio = mappaWidth / mappaHeight;

    const isMobile = this.p.width < 768;
    let marginHeight = this.p.height * this.CONFIG.margini.verticale * (isMobile ? 0.6 : 0.8);
    let scaleFactor = marginHeight / mappaHeight;
    let scaledWidth = marginHeight * aspectRatio;

    let offsetX = (this.p.width - scaledWidth) / 2;
    let offsetY = (this.p.height - marginHeight) / 2;

    let raggio = marginHeight / (isMobile ? 55 : 45);

    return { minX, maxX, minY, maxY, scaleFactor, offsetX, offsetY, raggio };
  }

  _creaEsagono(riga, params) {
    const {
      minX,
      maxX,
      minY,
      maxY,
      offsetX,
      offsetY,
      scaleFactor,
      raggio,
      minSovraffollamento,
      maxSovraffollamento,
      contatoreRegioni,
    } = params;

    let x = parseFloat(riga.get("x").replace(",", "."));
    let y = parseFloat(riga.get("y").replace(",", "."));
    let sovraffollamento = parseFloat(riga.get("sovraffollamento"));
    let regione = riga.get("regione");
    let carcere = riga.get("carcere");
    let persone = parseInt(riga.get("persone"));
    let spazio = parseFloat(riga.get("spazio").replace(",", "."));
    let hexId = riga.get("hexagon_id");

    if (!contatoreRegioni.has(regione)) {
      contatoreRegioni.set(regione, 1);
    } else {
      contatoreRegioni.set(regione, contatoreRegioni.get(regione) + 1);
    }

    let mappedX = this.p.map(
      x,
      minX,
      maxX,
      offsetX,
      offsetX + scaleFactor * (maxX - minX)
    );
    let mappedY = this.p.map(
      y,
      minY,
      maxY,
      offsetY,
      offsetY + scaleFactor * (maxY - minY)
    );

    let colore = this.calcolaColore(
      sovraffollamento,
      minSovraffollamento,
      maxSovraffollamento
    );

    let esagono = new Esagono(
      mappedX,
      mappedY,
      raggio,
      regione,
      colore,
      contatoreRegioni.get(regione),
      this.p
    );
    esagono.sovraffollamento = sovraffollamento;
    esagono.carcere = carcere;
    esagono.persone = persone;
    esagono.spazio = spazio;
    esagono.id = hexId;
    return esagono;
  }

  _calcolaCentriRegioni() {
    for (let [regione, esagoni] of this._cache.esagoniPerRegione) {
      let sommaX = 0,
        sommaY = 0;
      esagoni.forEach((esagono) => {
        sommaX += esagono.originalX;
        sommaY += esagono.originalY;
      });
      this._cache.centroRegioni.set(regione, {
        x: sommaX / esagoni.length,
        y: sommaY / esagoni.length,
      });
    }
  }

  getEsagoniRegione(regione) {
    return this._cache.esagoniPerRegione.get(regione) || [];
  }

  getCentroRegione(regione) {
    return this._cache.centroRegioni.get(regione);
  }

  calcolaColore(sovraffollamento, min, max) {
    if (sovraffollamento <= 100) {
      return this.p.lerpColor(
        this.p.color(this.CONFIG.colori.esagonoBase),
        this.p.color(this.CONFIG.colori.esagonoMedio),
        this.p.map(sovraffollamento, 0, 100, 0, 1)
      );
    } else if (sovraffollamento <= 150) {
      return this.p.lerpColor(
        this.p.color(this.CONFIG.colori.esagonoMedio),
        this.p.color(this.CONFIG.colori.esagonoAlto),
        this.p.map(sovraffollamento, 100, 150, 0, 1)
      );
    }
    return this.p.color(this.CONFIG.colori.esagonoAlto);
  }

  aggiorna() {
    if (this.fadeInProgress < 1) {
      this.fadeInProgress = this.p.min(this.fadeInProgress + 0.0083, 1);
    }

    let nuovaRegioneHover = null;
    let nuovaCellaHover = null;

    if (this.gestoreEsagoni.esagonoIngrandito) {
      nuovaCellaHover = this.trovaCellaHover();
    } else {
      nuovaRegioneHover = this.trovaRegioneHover();
    }

    if (nuovaRegioneHover !== this.regioneHover) {
      this.regioneHover = nuovaRegioneHover;
    }

    if (nuovaCellaHover !== this.cellaHover) {
      this.cellaHover = nuovaCellaHover;
    }

    for (let esagono of this.esagoni) {
      esagono.aggiorna();
      this.aggiornaStatoEsagono(esagono);
      if (esagono.scaleMultiplier !== esagono.targetScale) {
        esagono.scaleMultiplier = this.p.lerp(
          esagono.scaleMultiplier,
          esagono.targetScale,
          0.1
        );
      }
    }

    this.gestoreTesto.aggiornaTesto(
      this.regioneSelezionata || this.regioneHover,
      this.esagonoCliccato || this.cellaHover || this.regioneHover
    );
  }

  trovaRegioneHover() {
    for (let esagono of this.esagoni) {
      let distanza = this.p.dist(this.p.mouseX, this.p.mouseY, esagono.x, esagono.y);
      if (distanza < esagono.raggio * 1.5) {
        return this.regioneSelezionata
          ? esagono.regione === this.regioneSelezionata
            ? esagono
            : null
          : esagono.regione;
      }
    }
    return null;
  }

  aggiornaStatoEsagono(esagono) {
    if (!this.hoverAttivo) {
      esagono.hoverState = 0;
      if (this.gestoreEsagoni.esagonoIngrandito === esagono) {
        esagono.opacita = 255 * this.fadeInProgress;
      } else {
        esagono.opacita = 255 * this.fadeInProgress;
      }
      return;
    }

    let targetHoverState = 0;
    if (this.regioneSelezionata) {
      targetHoverState =
        this.regioneHover === esagono || this.esagonoCliccato === esagono ? 1 : 0;
    } else {
      targetHoverState = esagono.regione === this.regioneHover ? 1 : 0;
    }
    esagono.hoverState = this.p.lerp(esagono.hoverState, targetHoverState, 0.2);

    let targetOpacita = 255;
    if (this.regioneSelezionata) {
      if (this.esagonoCliccato === esagono) {
        targetOpacita = 255;
      } else {
        targetOpacita = 255;
      }
    } else if (this.regioneHover) {
      targetOpacita = esagono.regione === this.regioneHover ? 255 : 100;
    }
    esagono.opacita = this.p.lerp(
      esagono.opacita,
      targetOpacita * this.fadeInProgress,
      0.1
    );
  }

  gestisciClick(mouseX, mouseY) {
    switch (this.stato) {
      case StatoMappa.ITALIA:
        this._gestisciClickItalia(mouseX, mouseY);
        break;
      case StatoMappa.REGIONE:
        this._gestisciClickRegione(mouseX, mouseY);
        break;
      case StatoMappa.CELLA:
        this._gestisciClickCella(mouseX, mouseY);
        break;
      default:
        break;
    }
  }

  _gestisciClickItalia(mouseX, mouseY) {
    for (let esagono of this.esagoni) {
      let distanza = this.p.dist(mouseX, mouseY, esagono.x, esagono.y);
      if (distanza < esagono.raggio * 1.5) {
        this._selezionaRegione(esagono);
        break;
      }
    }
  }

  _gestisciClickRegione(mouseX, mouseY) {
    let italiaCliccata = this.esagoni.some((esagono) => {
      if (esagono.regione !== this.regioneSelezionata) {
        let distanza = this.p.dist(mouseX, mouseY, esagono.x, esagono.y);
        return distanza < esagono.raggio * esagono.scaleMultiplier * 1.5;
      }
      return false;
    });

    if (italiaCliccata) {
      this._tornaAllaVistaPrincipale();
      return;
    }

    for (let esagono of this.esagoni) {
      if (esagono.regione === this.regioneSelezionata) {
        let distanza = this.p.dist(mouseX, mouseY, esagono.x, esagono.y);
        let raggioEffettivo = esagono.raggio * esagono.scaleMultiplier;

        if (distanza < raggioEffettivo * 1.5) {
          this.stato = StatoMappa.CELLA;
          this.gestoreEsagoni.gestisciClickEsagonoRegione(esagono);
          this.esagonoCliccato = null;
          this.cellaHover = null;
          this.gestoreTesto.resetStatoCompleto();
          return;
        }
      }
    }
  }

  _gestisciClickCella(mouseX, mouseY) {
    if (this.gestoreEsagoni.esagonoIngrandito) {
      let regioneEsagoni = this.getEsagoniRegione(this.regioneSelezionata);

      for (let esagono of regioneEsagoni) {
        let distanza = this.p.dist(mouseX, mouseY, esagono.x, esagono.y);
        let raggioEffettivo = esagono.raggio * esagono.scaleMultiplier;

        if (distanza < raggioEffettivo * 1.5) {
          this.stato = StatoMappa.REGIONE;
          this.gestoreEsagoni.gestisciClickEsagonoRegione(
            this.gestoreEsagoni.esagonoIngrandito
          );
          this.cellaHover = null;
          this.gestoreTesto.resetStatoCompleto();
          return;
        }
      }
    }
  }

  _selezionaRegione(esagono) {
    this.esagonoCliccato = null;
    this.cellaHover = null;
    this.regioneHover = null;
    this.gestoreTesto.resetStato();

    this.regioneSelezionata = esagono.regione;
    this.stato = StatoMappa.REGIONE;

    const descrizioneRegione = this.tabella?.rows
      .find((row) => row.get("regione") === esagono.regione)
      ?.get("descrizione");

    this.gestoreTesto.gestoreRegione.setRegioneCliccata(
      true,
      esagono.regione,
      descrizioneRegione
    );

    let regioneEsagoni = this.esagoni.filter(
      (e) => e.regione === this.regioneSelezionata
    );
    let centerX =
      regioneEsagoni.reduce((sum, h) => sum + h.originalX, 0) /
      regioneEsagoni.length;
    let centerY =
      regioneEsagoni.reduce((sum, h) => sum + h.originalY, 0) /
      regioneEsagoni.length;

    regioneEsagoni.forEach((hex) => {
      let offsetX = hex.originalX - centerX;
      let offsetY = hex.originalY - centerY;
      hex.targetX = this.p.width * 0.5 + offsetX * 1.5;
      hex.targetY = this.p.height * 0.5 + offsetY * 1.5;
      hex.targetScale = 1.5;
    });

    this.esagoni
      .filter((e) => e.regione !== this.regioneSelezionata)
      .forEach((hex) => {
        hex.targetX = hex.originalX * 0.3 + this.p.width * -0.01;
        hex.targetY = hex.originalY * 0.3 + this.p.height * 0.35;
        hex.targetScale = 0.3;
        hex.disattivaAnimazione();
      });
  }

  _tornaAllaVistaPrincipale() {
    this.esagoni.forEach((hex) => {
      hex.targetX = hex.originalX;
      hex.targetY = hex.originalY;
      hex.targetScale = 1;
      hex.disattivaAnimazione();
    });
    this.regioneSelezionata = null;
    this.stato = StatoMappa.ITALIA;
    this.esagonoCliccato = null;
    this.cellaHover = null;
    this.regioneHover = null;
    this.gestoreTesto.resetStatoRegione();
  }

  disegna() {
    for (let esagono of this.esagoni) {
      if ((esagono.regione !== this.regioneHover && esagono !== this.cellaHover) || !this.hoverAttivo) {
        esagono.disegna();
      }
    }

    for (let esagono of this.esagoni) {
      if ((esagono.regione === this.regioneHover || esagono === this.cellaHover) && this.hoverAttivo) {
        esagono.disegna();
      }
    }
  }

  trovaCellaHover() {
    if (this.gestoreEsagoni.esagonoIngrandito) {
      return this.gestoreEsagoni.esagonoIngrandito;
    }

    if (!this.regioneSelezionata) {
      return null;
    }

    const regioneEsagoni = this.esagoni.filter(
      (e) => e.regione === this.regioneSelezionata
    );

    for (let esagono of regioneEsagoni) {
      let distanza = this.p.dist(this.p.mouseX, this.p.mouseY, esagono.x, esagono.y);
      let areaHover = esagono.scaleMultiplier > 1.5 ? 20.0 : 1.5;
      let raggioEffettivo = esagono.raggio * esagono.scaleMultiplier * areaHover;

      if (distanza < raggioEffettivo) {
        return esagono;
      }
    }
    return null;
  }

  ridimensiona() {
    if (this.tabella) {
      this.esagoni = [];
      this._cache.esagoniPerRegione = new Map();
      this._cache.centroRegioni = new Map();
      this._cache.dimensioniMappa = null;
      this.caricaDati(this.tabella);
    }
  }
}
