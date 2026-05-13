import { Esagono } from "../modelli/Esagono.js";

export class Legenda {
    constructor(font, p) {
        this.p = p;
        this.testoComune = [
            "",
            "Il colore degli esagoni indica",
            "progressivamente il livello",
            "di sovraffollamento del carcere.",
        ];

        this.testiPerFase = {
            italia: [
                "Questa è la situazione delle",
                "carceri nel nostro paese.",
                "Passando il mouse sopra gli esagoni e",
                "cliccando potrai ottenere più informazioni."
            ]
        };

        this.faseCorrente = 'italia';
        this.testo = [...this.testiPerFase[this.faseCorrente], ...this.testoComune];
        this.testoEsagoni = [
            "Grave sovraffollamento",
            "Nei limiti normativi"
        ];
        this.testoCorrente = [];
        this.rigaCorrente = 0;
        this.indice = 0;
        this.testoEsagoniCorrente = ["", ""];
        this.rigaEsagoniCorrente = 0;
        this.indiceEsagoni = 0;
        this.velocitaScrittura = 10;
        this.ultimoAggiornamento = 0;
        this.font = font;
        this.altezzaRiga = 20;
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
        const isMobile = this.p.width < 768;
        const raggioEsagono = isMobile ? 10 : 15;
        const baseX = this.p.width / (isMobile ? 8 : 13);
        const yBase = this.p.height - (isMobile ? 200 : 150);
        const yBase2 = this.p.height - (isMobile ? 160 : 100);
        
        this.esagoni = [
            new Esagono(baseX, yBase, raggioEsagono, "regione1", this.p.color("red"), "1", this.p),
            new Esagono(baseX, yBase2, raggioEsagono, "regione2", this.p.color("white"), "2", this.p)
        ];
        
        this.esagoni[1].sovraffollamento = 150;
        this.esagoni[1].attivaAnimazione();

        this.esagoni.forEach(esagono => {
            esagono.hoverState = 1;
        });
    }

    disegna() {
        if (this.esagoni.length === 0) {
            this.initEsagoni();
        }

        const isMobile = this.p.width < 768;
        const baseX = this.p.width / (isMobile ? 8 : 13);
        const yBase = this.p.height - (isMobile ? 200 : 150);
        const yBase2 = this.p.height - (isMobile ? 160 : 100);
        const altezzaRiga = isMobile ? 16 : 20;

        this.p.push();
        this.p.fill(255);
        this.p.noStroke();
        this.p.textFont(this.font);
        this.p.textSize(isMobile ? 12 : 16);
        this.p.textAlign(this.p.LEFT, this.p.CENTER);

        for (let i = 0; i < this.testoCorrente.length; i++) {
            this.p.text(this.testoCorrente[i], baseX, yBase - 120 + (i - 4) * altezzaRiga);
        }

        if (this.rigaCorrente >= this.testo.length) {
            if (!this.animazionePartita) {
                this.inizioAnimazione = this.p.millis();
                this.animazionePartita = true;
            }

            let tempoTrascorso = this.p.millis() - this.inizioAnimazione;
            
            this.opacitaPrimoEsagono = this.p.min(255, this.p.map(tempoTrascorso, 0, this.durataFadeIn, 0, 255));
            
            if (tempoTrascorso > this.durataFadeIn) {
                let tempoLinea = tempoTrascorso - this.durataFadeIn;
                this.lunghezzaLinea = this.p.min(50, this.p.map(tempoLinea, 0, this.durataLinea, 0, 50));
                
                if (tempoLinea > this.durataLinea/2) {
                    this.opacitaSecondoEsagono = this.p.min(255, this.p.map(tempoLinea - this.durataLinea/2, 0, this.durataFadeIn, 0, 255));
                }
            }

            if (this.lunghezzaLinea > 0) {
                this.p.stroke(255);
                this.p.strokeWeight(isMobile ? 2 : 3);
                this.p.line(baseX, yBase, baseX, yBase + this.lunghezzaLinea);
                this.p.noStroke();
            }

            if (this.opacitaPrimoEsagono > 0) {
                this.esagoni[0].x = baseX;
                this.esagoni[0].y = yBase;
                this.esagoni[0].opacita = this.opacitaPrimoEsagono;
                this.esagoni[0].disegna();
                this.p.fill(255);
                this.p.text(this.testoEsagoniCorrente[0], baseX + (isMobile ? 25 : 30), yBase - 2);
            }
            
            if (this.opacitaSecondoEsagono > 0) {
                this.esagoni[1].x = baseX;
                this.esagoni[1].y = yBase2;
                this.esagoni[1].opacita = this.opacitaSecondoEsagono;
                this.esagoni[1].disegna();
                this.p.fill(255);
                this.p.text(this.testoEsagoniCorrente[1], baseX + (isMobile ? 25 : 30), yBase2 - 2);
            }
        }
        
        this.p.pop();

        if (this.p.millis() - this.ultimoAggiornamento > this.velocitaScrittura) {
            if (this.rigaCorrente < this.testo.length) {
                if (this.indice === 0) {
                    this.testoCorrente.push("");
                }
                
                if (this.indice < this.testo[this.rigaCorrente].length) {
                    this.testoCorrente[this.rigaCorrente] += this.testo[this.rigaCorrente].charAt(this.indice);
                    this.indice++;
                } else {
                    this.rigaCorrente++;
                    this.indice = 0;
                }
                this.ultimoAggiornamento = this.p.millis();
            }
            else if (this.rigaEsagoniCorrente < this.testoEsagoni.length) {
                if (this.rigaEsagoniCorrente === 1 && 
                    this.p.millis() - this.inizioAnimazione <= this.durataFadeIn + this.durataLinea/2) {
                    return;
                }
                
                if (this.indiceEsagoni < this.testoEsagoni[this.rigaEsagoniCorrente].length) {
                    this.testoEsagoniCorrente[this.rigaEsagoniCorrente] += 
                        this.testoEsagoni[this.rigaEsagoniCorrente].charAt(this.indiceEsagoni);
                    this.indiceEsagoni++;
                } else {
                    this.rigaEsagoniCorrente++;
                    this.indiceEsagoni = 0;
                }
                this.ultimoAggiornamento = this.p.millis();
            }
        }
    }

    reset() {
        this.testoCorrente = [];
        this.testoEsagoniCorrente = ["", ""];
        this.rigaCorrente = 0;
        this.rigaEsagoniCorrente = 0;
        this.indice = 0;
        this.indiceEsagoni = 0;
        this.opacitaPrimoEsagono = 0;
        this.opacitaSecondoEsagono = 0;
        this.lunghezzaLinea = 0;
        this.animazionePartita = false;
    }

    cambiaFase(nuovaFase) {
        if (this.faseCorrente !== nuovaFase) {
            this.faseCorrente = nuovaFase;
            this.testo = [...this.testiPerFase[nuovaFase], ...this.testoComune];
            this.reset();
        }
    }
}
