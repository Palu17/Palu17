export class Bottone {
    constructor(p, options = {}) {
        this.p = p;
        this.testo = options.testo || "";
        this.taglia = options.taglia || "medio";
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.colore = options.colore || [255, 255, 255];
        this.coloreTesto = options.coloreTesto || [0, 0, 0];
        this.visibile = options.visibile !== undefined ? options.visibile : true;
        this.opacita = options.opacita !== undefined ? options.opacita : 255;
        this.onClick = options.onClick || null;
        this.hover = false;
        this.opacitaHover = 255;

        this.dimensioni = {
            piccolo: { larghezza: 160, altezza: 48, textSize: 18 },
            medio: { larghezza: 220, altezza: 56, textSize: 20 },
            grande: { larghezza: 280, altezza: 64, textSize: 24 }
        };

        this.dim = this.dimensioni[this.taglia];
    }

    draw() {
        if (!this.visibile) return;

        this.hover = this.isMouseOver();

        if (this.hover) {
            this.p.cursor(this.p.HAND);
            this.opacitaHover = this.p.lerp(this.opacitaHover, 200, 0.1);
        } else {
            this.p.cursor(this.p.ARROW);
            this.opacitaHover = this.p.lerp(this.opacitaHover, 255, 0.1);
        }

        let opacitaEffettiva = this.p.min(this.opacita, this.opacitaHover);

        this.p.fill(this.colore[0], this.colore[1], this.colore[2], opacitaEffettiva);
        this.p.rect(
            this.x - this.dim.larghezza / 2,
            this.y - this.dim.altezza / 2,
            this.dim.larghezza,
            this.dim.altezza,
            8
        );

        this.p.fill(this.coloreTesto[0], this.coloreTesto[1], this.coloreTesto[2], opacitaEffettiva);
        this.p.textSize(this.dim.textSize);
        this.p.text(
            this.testo,
            this.x,
            this.y
        );
    }

    isMouseOver() {
        if (!this.visibile) return false;
        return (
            this.p.mouseX > this.x - this.dim.larghezza / 2 &&
            this.p.mouseX < this.x + this.dim.larghezza / 2 &&
            this.p.mouseY > this.y - this.dim.altezza / 2 &&
            this.p.mouseY < this.y + this.dim.altezza / 2
        );
    }

    handleClick() {
        if (this.isMouseOver() && this.onClick) {
            this.onClick();
            return true;
        }
        return false;
    }

    setVisibile(visibile) {
        this.visibile = visibile;
    }

    setOpacita(opacita) {
        this.opacita = opacita;
    }

    setPosizione(x, y) {
        this.x = x;
        this.y = y;
    }

    setTesto(testo) {
        this.testo = testo;
    }
}