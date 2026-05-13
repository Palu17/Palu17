import { CONFIGURAZIONE, ASSETS } from "../configurazione/config.js";

export class GestoreSvg {
    constructor(p) {
        this.p = p;
        this.svg = null;
        this.isLoaded = false;
        this.opacita = 0;
        this.targetOpacita = 0;
        this.tentativi = 0;
        this.maxTentativi = 3;
        this.caricaSVG();
    }

    caricaSVG() {
        const percorsoSVG = ASSETS.svgCella;
        console.log('Tentativo di caricamento SVG:', percorsoSVG);
        
        this.p.loadImage(
            percorsoSVG,
            (img) => {
                if (img.width === 0 || img.height === 0) {
                    console.warn('SVG caricato ma invalido, riprovo...');
                    if (this.tentativi < this.maxTentativi) {
                        this.tentativi++;
                        setTimeout(() => this.caricaSVG(), 1000);
                    }
                    return;
                }
                console.log('SVG caricato correttamente:', img.width, 'x', img.height);
                this.svg = img;
                this.isLoaded = true;
            },
            (err) => {
                console.error('Errore nel caricamento dell\'SVG:', err);
                if (this.tentativi < this.maxTentativi) {
                    this.tentativi++;
                    setTimeout(() => this.caricaSVG(), 1000);
                }
            }
        );
    }

    impostaOpacita(valore) {
        this.targetOpacita = valore;
    }

    aggiornaOpacita() {
        this.opacita = this.p.lerp(
            this.opacita,
            this.targetOpacita,
            CONFIGURAZIONE.animazioni.easing
        );
    }

    visualizza(esagonoIngrandito) {
        if (!this.isLoaded || !esagonoIngrandito) {
            return;
        }

        try {
            this.aggiornaOpacita();
            
            this.p.push();
            this.p.tint(255, this.opacita * 255);
            
            const config = CONFIGURAZIONE.svg.proporzioni;
            let svgWidth = esagonoIngrandito.raggio * esagonoIngrandito.scaleMultiplier * config.larghezza;
            let svgHeight = svgWidth * config.rapporto;
            let svgX = esagonoIngrandito.x - svgWidth / 2;
            let svgY = esagonoIngrandito.y - svgHeight / 2;
            
            this.p.image(this.svg, svgX, svgY, svgWidth, svgHeight);
            this.p.pop();
        } catch (error) {
            console.error('Errore nel disegno dell\'SVG:', error);
        }
    }

    ridimensiona() {}
} 
