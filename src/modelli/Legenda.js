import { Esagono } from "../modelli/Esagono.js";

export class Legenda {
    constructor(p) {
        this.p = p;
        this.esagoni = [];
        this.opacitaPrimoEsagono = 0;
        this.opacitaSecondoEsagono = 0;
        this.lunghezzaLinea = 0;
        this.inizioAnimazione = 0;
        this.durataFadeIn = 1000;
        this.durataLinea = 1000;
        this.animazionePartita = false;
    }

    initEsagoni() {
        const baseX = this.p.width * 0.35;
        const yBase = this.p.height * 0.25;
        const yBase2 = this.p.height * 0.72;

        this.esagoni = [
            new Esagono(baseX, yBase, 15, "regione1", this.p.color("red"), "1", this.p),
            new Esagono(baseX, yBase2, 15, "regione2", this.p.color("white"), "2", this.p)
        ];

        this.esagoni[1].sovraffollamento = 150;
        this.esagoni[1].attivaAnimazione();
        this.esagoni.forEach(esagono => { esagono.hoverState = 1; });
    }

    disegna() {
        if (this.esagoni.length === 0) this.initEsagoni();

        const baseX = this.esagoni[0].x;
        const yBase = this.esagoni[0].y;
        const yBase2 = this.esagoni[1].y;

        if (!this.animazionePartita) {
            this.inizioAnimazione = this.p.millis();
            this.animazionePartita = true;
        }

        let tempoTrascorso = this.p.millis() - this.inizioAnimazione;
        this.opacitaPrimoEsagono = this.p.min(255, this.p.map(tempoTrascorso, 0, this.durataFadeIn, 0, 255));

        if (tempoTrascorso > this.durataFadeIn) {
            let tempoLinea = tempoTrascorso - this.durataFadeIn;
            let maxLinea = yBase2 - yBase;
            this.lunghezzaLinea = this.p.min(maxLinea, this.p.map(tempoLinea, 0, this.durataLinea, 0, maxLinea));
            if (tempoLinea > this.durataLinea / 2) {
                this.opacitaSecondoEsagono = this.p.min(255, this.p.map(tempoLinea - this.durataLinea / 2, 0, this.durataFadeIn, 0, 255));
            }
        }

        if (this.lunghezzaLinea > 0) {
            this.p.push();
            this.p.stroke(255);
            this.p.strokeWeight(2);
            this.p.line(baseX, yBase, baseX, yBase + this.lunghezzaLinea);
            this.p.noStroke();
            this.p.pop();
        }

        if (this.opacitaPrimoEsagono > 0) {
            this.esagoni[0].x = baseX;
            this.esagoni[0].y = yBase;
            this.esagoni[0].opacita = this.opacitaPrimoEsagono;
            this.esagoni[0].disegna();
        }

        if (this.opacitaSecondoEsagono > 0) {
            this.esagoni[1].x = baseX;
            this.esagoni[1].y = yBase2;
            this.esagoni[1].opacita = this.opacitaSecondoEsagono;
            this.esagoni[1].disegna();
        }
    }
}
