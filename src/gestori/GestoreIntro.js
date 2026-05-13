import { CONFIGURAZIONE, ASSETS } from "../configurazione/config.js";
import { Bottone } from "./Bottone.js";

export class GestoreIntro {
    constructor(gestoreAnimazioni, p) {
        this.gestoreAnimazioni = gestoreAnimazioni;
        this.p = p;
        this.font = this.p.loadFont(ASSETS.fontIntro);
        this.attivo = true;
        
        const config = CONFIGURAZIONE;
        this.testoRiga1 = config.testi.intro.riga1;
        this.testoRiga2 = config.testi.intro.riga2;
        this.testoCorrente1 = "";
        this.testoCorrente2 = "";
        this.inTransizione = false;
        this.durataTransizione = config.animazioni.durata.transizione;
        this.tempoInizioTransizione = 0;
        this.inCancellazione = false;
        this.ultimaCancellazione = 0;
        this.velocitaCancellazione = config.animazioni.velocita.cancellazione;
        this.opacitaGenerale = 255;
        this.velocitaScrittura = config.animazioni.velocita.scrittura || 50;
        this.ultimaScrittura = 0;
        this.opacitaBottone = 0;
        this.bottoneVisibile = false;

        this.bottone = new Bottone(p, {
            taglia: "grande",
            testo: "scopri di più",
            x: p.width / 2,
            y: p.height / 2 + p.height * 0.13,
            visibile: false
        });
    }

    aggiorna() {
        if (!this.attivo && !this.inTransizione) return;

        if (this.inTransizione) {
            let tempoCorrente = this.p.millis();
            
            if (this.inCancellazione) {
                if (tempoCorrente - this.ultimaCancellazione > this.velocitaCancellazione) {
                    if (this.testoCorrente2.length > 0) {
                        this.testoCorrente2 = this.testoCorrente2.slice(0, -1);
                    } 
                    else if (this.testoCorrente1.length > 0) {
                        this.testoCorrente1 = this.testoCorrente1.slice(0, -1);
                    }
                    else {
                        this.inCancellazione = false;
                        this.tempoInizioTransizione = tempoCorrente;
                    }
                    this.ultimaCancellazione = tempoCorrente;
                }
                return;
            }

            let tempoTrascorso = tempoCorrente - this.tempoInizioTransizione;
            let progressione = tempoTrascorso / this.durataTransizione;
            
            if (progressione >= 1) {
                this.attivo = false;
                this.inTransizione = false;
                this.opacitaGenerale = 0;
                this.opacitaItalia = 255;
            } else {
                let easeProgressione = this.easeInOutCubic(progressione);
                this.opacitaGenerale = this.p.lerp(255, 0, easeProgressione);
                this.opacitaItalia = this.p.lerp(0, 255, easeProgressione);
            }
            return;
        }

        let tempoCorrente = this.p.millis();
        if (tempoCorrente - this.ultimaScrittura > this.velocitaScrittura) {
            this.testoCorrente1 = this.gestoreAnimazioni.animaTesto(
                this.testoCorrente1,
                this.testoRiga1
            );

            if (this.testoCorrente1 === this.testoRiga1) {
                this.testoCorrente2 = this.gestoreAnimazioni.animaTesto(
                    this.testoCorrente2,
                    this.testoRiga2
                );
            }
            this.ultimaScrittura = tempoCorrente;
        }

        if (this.testoCorrente2 === this.testoRiga2) {
            this.bottoneVisibile = true;
            this.bottone.setVisibile(true);
            this.opacitaBottone = this.p.lerp(this.opacitaBottone, 255, 0.1);
        }
    }

    disegna() {
        if (!this.attivo && !this.inTransizione) return;

        this.p.push();
        this.p.textFont(this.font);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        const ts = Math.max(this.p.height * 0.05, 26);
        this.p.textSize(ts);
        this.p.fill(255, this.opacitaGenerale);
        
        this.p.text(this.testoCorrente1, this.p.width / 2, this.p.height / 2 - ts * 0.7);
        this.p.text(this.testoCorrente2, this.p.width / 2, this.p.height / 2 + ts * 1.1);

        if (this.bottoneVisibile) {
            this.bottone.setOpacita(this.opacitaBottone);
            this.bottone.draw();
        }
        this.p.pop();
    }

    gestisciClick() {
        if (this.bottone.handleClick() && !this.inTransizione) {
            this.inTransizione = true;
            this.inCancellazione = true;
            this.ultimaCancellazione = this.p.millis();
            return true;
        }
        return false;
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    getOpacitaItalia() {
        return this.opacitaItalia;
    }
}
