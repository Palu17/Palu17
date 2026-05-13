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
      this.p.push();
      this.p.translate(this.x, this.y);
      this.p.rotate(this.rotazione);
      
      this.p.fill(this.p.color(255, 50, 50, 200));
      this.p.beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * this.p.cos(angolo * this.p.PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * this.p.sin(angolo * this.p.PI / 3);
        this.p.vertex(verticeX, verticeY);
      }
      this.p.endShape(this.p.CLOSE);
      
      this.p.push();
      
      if (this.spostamentoAttivo || this.inUscita) {
        let spostamento = this.spostamentoBianco * this.scaleMultiplier;
        this.p.translate(spostamento * this.p.cos(2 * this.p.PI / 3), -spostamento * this.p.sin(2 * this.p.PI / 3));
      }
      
      this.p.fill('black');
      this.p.beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * this.p.cos(angolo * this.p.PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * this.p.sin(angolo * this.p.PI / 3);
        this.p.vertex(verticeX, verticeY);
      }
      this.p.endShape(this.p.CLOSE);
      
      this.p.pop();
      
      let strokeColor = this.p.lerpColor(this.p.color("grey"), this.p.color("white"), this.hoverState);
      let strokeW = this.p.lerp(2, 3, this.hoverState);
      this.p.stroke(strokeColor.levels[0], strokeColor.levels[1], strokeColor.levels[2], this.opacita);
      this.p.strokeWeight(strokeW);
      
      this.p.drawingContext.shadowBlur = this.p.lerp(0, 50, this.hoverState);
      this.p.drawingContext.shadowColor = this.p.color(
        this.p.red(this.colore), 
        this.p.green(this.colore), 
        this.p.blue(this.colore), 
        this.p.lerp(0, this.opacita, this.hoverState)
      );
      
      this.p.noFill();
      this.p.beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * this.p.cos(angolo * this.p.PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * this.p.sin(angolo * this.p.PI / 3);
        this.p.vertex(verticeX, verticeY);
      }
      this.p.endShape(this.p.CLOSE);
      
      this.p.strokeWeight(0);
      
      let targetOffsetX = -4.8 * this.scaleMultiplier;
      let targetOffsetY = -5.6 * this.scaleMultiplier;
      let currentOffsetX = 0;
      let currentOffsetY = 0;
      
      if (this.scaleMultiplier > 1.5) {
        let progress = this.p.map(this.scaleMultiplier, 1.5, 20.0, 0, 1);
        currentOffsetX = this.p.lerp(0, targetOffsetX, progress);
        currentOffsetY = this.p.lerp(0, targetOffsetY, progress);
      }
      
      
      let dimensioneInterna = this.p.map(this.scaleMultiplier, 1, 20, 0.5, 0.3);
      this.p.fill(this.p.color(this.p.red(this.colore), this.p.green(this.colore), this.p.blue(this.colore), this.opacita));
      this.p.ellipse(currentOffsetX, currentOffsetY, this.raggio * this.scaleMultiplier * dimensioneInterna);
      
      let dimensioneEsterna = this.p.map(this.scaleMultiplier, 1, 20, 1, 0.65);
      this.p.fill(this.p.color(this.p.red(this.colore), this.p.green(this.colore), this.p.blue(this.colore), this.opacita * 0.4));
      this.p.ellipse(currentOffsetX, currentOffsetY, this.raggio * this.scaleMultiplier * dimensioneEsterna);
      
      if (this.scaleMultiplier > 1.5) {
        this.p.drawingContext.filter = 'none';
      }
      
      if (this.scaleMultiplier >= this.SCALA_GRANDE) {
        this.p.fill(0);
        this.p.noStroke();
        this.p.beginShape();
        for (let angolo = 0; angolo < this.p.TWO_PI; angolo += this.p.TWO_PI / 6) {
          let x = this.p.cos(angolo) * this.raggio * this.scaleMultiplier * 0.9;
          let y = this.p.sin(angolo) * this.raggio * this.scaleMultiplier * 0.9;
          this.p.vertex(x + this.esagonoInterno?.x || 0, y + this.esagonoInterno?.y || 0);
        }
        this.p.endShape(this.p.CLOSE);
      }
      
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