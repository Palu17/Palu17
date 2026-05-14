const VERTEX_COS = [1, 0.5, -0.5, -1, -0.5, 0.5];
const VERTEX_SIN = [0, 0.8660254037844386, 0.8660254037844386, 0, -0.8660254037844386, -0.8660254037844386];
const COS_120 = -0.5;
const SIN_120 = 0.8660254037844386;

export class Esagono {
    constructor(x, y, raggio, regione, colore, id, p) {
      this.p = p;
      this.x = x;
      this.y = y;
      this.originalX = x;
      this.originalY = y;
      this.raggio = raggio;
      this.regione = regione;
      this.colore = colore;
      this._cr = p.red(colore);
      this._cg = p.green(colore);
      this._cb = p.blue(colore);
      this.opacita = 0;
      this.hoverState = 0;
      this.targetX = x;
      this.targetY = y;
      this.scaleMultiplier = 1;
      this.rotazione = p.HALF_PI;
      this.currentScale = 1;
      this.targetScale = 1;
      this.esagonoInterno = null;
      this.id = id;
      this.sovraffollamento = 0;
      this.spostamentoAttivo = false;
      this.tempoClick = 0;
      this.spostamentoBianco = 0;
      this.targetSpostamentoBianco = 0;
      this.inUscita = false;
      this.tempoInizioUscita = 0;
      this.durataUscita = 1000;
      this.SCALA_GRANDE = 20.0;
      this._v = Array.from({ length: 6 }, () => ({ x: 0, y: 0 }));
    }

    aggiorna() {
      this.x = this.p.lerp(this.x, this.targetX, 0.1);
      this.y = this.p.lerp(this.y, this.targetY, 0.1);

      if (this.tempoClick > 0 && !this.spostamentoAttivo && !this.inUscita) {
        if (this.p.millis() - this.tempoClick > 3000) {
          this.spostamentoAttivo = true;
          if (this.sovraffollamento > 100) {
            this.targetSpostamentoBianco = this.p.map(this.sovraffollamento, 100, 150, 0, this.raggio * 0.25);
          }
        }
      }

      if (this.inUscita) {
        let tempoTrascorso = this.p.millis() - this.tempoInizioUscita;
        let progresso = Math.min(tempoTrascorso / this.durataUscita, 1);
        let easeProgresso = this.easeInOutCubic(1 - progresso);
        this.spostamentoBianco = this.targetSpostamentoBianco * easeProgresso;
        if (progresso >= 1) {
          this.inUscita = false;
          this.spostamentoAttivo = false;
          this.tempoClick = 0;
          this.spostamentoBianco = 0;
          this.targetSpostamentoBianco = 0;
          this.tempoInizioUscita = 0;
        }
      } else if (this.spostamentoAttivo) {
        this.spostamentoBianco = this.p.lerp(this.spostamentoBianco, this.targetSpostamentoBianco, 0.1);
      }
    }

    easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    attivaAnimazione() {
      this.tempoClick = this.p.millis();
      this.spostamentoAttivo = false;
      this.spostamentoBianco = 0;
      this.inUscita = false;
    }

    disattivaAnimazione() {
      if (this.spostamentoAttivo && this.spostamentoBianco > 0) {
        this.inUscita = true;
        this.tempoInizioUscita = this.p.millis();
      } else {
        this.tempoClick = 0;
        this.spostamentoAttivo = false;
        this.spostamentoBianco = 0;
        this.targetSpostamentoBianco = 0;
      }
    }

    disegna() {
      const rs = this.raggio * this.scaleMultiplier;

      for (let i = 0; i < 6; i++) {
        this._v[i].x = rs * VERTEX_COS[i];
        this._v[i].y = rs * VERTEX_SIN[i];
      }

      let dInt, dEst, offP;
      if (this.scaleMultiplier <= 1) {
        dInt = 0.5; dEst = 1; offP = 0;
      } else {
        const t = (this.scaleMultiplier - 1) / 19;
        dInt = 0.5 - t * 0.2;
        dEst = 1 - t * 0.35;
        offP = this.scaleMultiplier > 1.5 ? (this.scaleMultiplier - 1.5) / 18.5 : 0;
      }

      this.p.push();
      this.p.translate(this.x, this.y);
      this.p.rotate(this.rotazione);

      this.p.fill(255, 50, 50, 200);
      this.p.beginShape();
      for (let i = 0; i < 6; i++) this.p.vertex(this._v[i].x, this._v[i].y);
      this.p.endShape(this.p.CLOSE);

      this.p.push();
      if (this.spostamentoAttivo || this.inUscita) {
        const sp = this.spostamentoBianco * this.scaleMultiplier;
        this.p.translate(sp * COS_120, -sp * SIN_120);
      }
      this.p.fill('black');
      this.p.beginShape();
      for (let i = 0; i < 6; i++) this.p.vertex(this._v[i].x, this._v[i].y);
      this.p.endShape(this.p.CLOSE);
      this.p.pop();

      const grey = Math.round(this.p.lerp(128, 255, this.hoverState));
      this.p.stroke(grey, this.opacita);
      this.p.strokeWeight(this.p.lerp(2, 3, this.hoverState));
      this.p.noFill();

      this.p.drawingContext.shadowBlur = this.p.lerp(0, 50, this.hoverState);
      this.p.drawingContext.shadowColor = `rgba(${this._cr},${this._cg},${this._cb},${this.p.lerp(0, this.opacita / 255, this.hoverState)})`;

      this.p.beginShape();
      for (let i = 0; i < 6; i++) this.p.vertex(this._v[i].x, this._v[i].y);
      this.p.endShape(this.p.CLOSE);
      this.p.strokeWeight(0);

      let offX = 0, offY = 0;
      if (offP > 0) {
        offX = this.p.lerp(0, -4.8 * this.scaleMultiplier, offP);
        offY = this.p.lerp(0, -5.6 * this.scaleMultiplier, offP);
      }

      this.p.fill(this._cr, this._cg, this._cb, this.opacita);
      this.p.ellipse(offX, offY, rs * dInt);

      this.p.fill(this._cr, this._cg, this._cb, this.opacita * 0.4);
      this.p.ellipse(offX, offY, rs * dEst);

      if (this.scaleMultiplier >= this.SCALA_GRANDE) {
        this.p.fill(0);
        this.p.noStroke();
        this.p.beginShape();
        const r2 = rs * 0.9;
        const ix = this.esagonoInterno?.x ?? 0;
        const iy = this.esagonoInterno?.y ?? 0;
        for (let i = 0; i < 6; i++) {
          this.p.vertex(r2 * VERTEX_COS[i] + ix, r2 * VERTEX_SIN[i] + iy);
        }
        this.p.endShape(this.p.CLOSE);
      }

      this.p.drawingContext.shadowBlur = 0;
      this.p.pop();
    }

    calcolaColoreSovraffollamento() {
      let intensita = this.p.map(this.sovraffollamento, 100, 150, 0, 1, true);
      intensita = this.p.constrain(intensita, 0, 1);

      let r = 255;
      let g = this.p.lerp(255, 0, intensita);
      let b = this.p.lerp(255, 0, intensita);

      return this.p.color(r, g, b);
    }
}
