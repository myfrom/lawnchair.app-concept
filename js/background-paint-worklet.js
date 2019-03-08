// Constants
const BG_COLOR = 'white';
const FILL_COLOR = '#F5F5F5';
const SCROLL_STEP = 15;



class BackgroundPaintWorklet {

  static get inputProperties() {
    return [
      '--paint-scroll-position'
    ];
  }

  paint(ctx, geom, properties) {
    const u = geom.width / 1280,
          scrollStep = SCROLL_STEP * u,
          scrollPos = parseInt(properties.get('--paint-scroll-position').toString()) || 0;
    
    ctx.fillStyle = FILL_COLOR;
    ctx.strokeStyle = BG_COLOR;

    for (let cy = 0; cy < geom.height; cy += 1600*u) {
      this.drawCircles(ctx, 100*u, 380*u, 200*u + scrollPos/scrollStep, 320*u, 12*u);
      this.drawCircles(ctx, 570*u, 1410*u, 200*u + scrollPos/scrollStep, 320*u, 12*u);
      this.drawDottedStrap(ctx, 350*u, scrollPos/scrollStep, 600*u, geom.width, 16*u);
      this.drawWaves(ctx, 980*u, 0, scrollPos/scrollStep, 160*u, 300*u, 10*u);
      this.drawWaves(ctx, 980*u, 1260*u, scrollPos/scrollStep,340*u, 300*u, 10*u);
      this.drawCross(ctx, 650*u, 240*u, 85 + scrollPos/scrollStep, 150*u, 30*u);
      this.drawCross(ctx, 455*u, 515*u, 25 + scrollPos/scrollStep, 110*u, 20*u);
      this.drawCross(ctx, 420*u, 1140*u, 25 + scrollPos/scrollStep, 160*u, 30*u);
      this.drawS(ctx, 980*u, 900*u, 30 + scrollPos/-scrollStep, 90*u, 30*u);
      ctx.translate(0, 1600*u);
    }
  }

  drawCross(ctx, x = 0, y = 0, rotate = 0, size = 160, width = 30) {
    const halfSize = size / 2;
    ctx.save();
    ctx.moveTo(0, 0);
    ctx.beginPath();
    ctx.translate(x + halfSize, y + halfSize);
    ctx.rotate(rotate * Math.PI/180);
    ctx.lineWidth = width;
    ctx.rect(width / -2, -halfSize, width, size);
    ctx.rect(-halfSize, width / -2, size, width);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  drawS(ctx, x = 0, y = 0, rotate = 0, height = 90, lineWidth = 30) {
    const scale = height / 90;
    const halfSize = scale / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate * Math.PI/180);
    ctx.scale(scale, scale);
    // Exported SVG path
    const path = new Path2D('M56 -40.4v-10h20v51.4a59.1 59.1 0 0 1-3.3 19.2 41.7 41.7 0 0 1-9.9 14.8 39.4 39.4 0 0 1-14.8 8.8 48.8 48.8 0 0 1-17.5 2.8 65.2 65.2 0 0 1-16.8-2.4 38.4 38.4 0 0 1-14.5-8.5 34.2 34.2 0 0 1-9-15c-1-3-1.8-6.2-2.2-9.3-.5-3.5-.7-7-.7-10.4a42 42 0 0 0-2.4-13.9 26.8 26.8 0 0 0-21.2-17c-2.2-.3-4.4-.5-6.6-.5-4.3 0-8.5.9-12.3 2.6a35.4 35.4 0 0 0-19.8 23.3c-.4 1.8-.6 3.7-.6 5.5v45.6h-20v-45.6a45.7 45.7 0 0 1 4.3-19.4 54.7 54.7 0 0 1 58.4-31.2 46.7 46.7 0 0 1 39.3 39.6c.6 3.7 1 7.4 1 11a56.1 56.1 0 0 0 1.7 13.5c.5 1.5 1.1 2.8 1.9 4.1a14.4 14.4 0 0 0 8.6 6.5 45.4 45.4 0 0 0 16.8 1 29.5 29.5 0 0 0 9.3-3.1 19 19 0 0 0 8.4-10 38.9 38.9 0 0 0 2-12v-41.4z');
    ctx.lineWidth = lineWidth;
    ctx.stroke(path);
    ctx.fill(path);
    ctx.restore();
  }

  drawWaves(ctx, x = 0, y = 0, offset = 0, height = 160, width = 310, lineWidth = 15) {
    while (offset > width) offset -= width;
    ctx.save();
    // First background rectangle
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(x-lineWidth, y-lineWidth, width + lineWidth*2, height + lineWidth*2);
    // Second rect, clip path
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    // ctx.clip(); FIXME: Breaks stuff
    // Waves
    ctx.strokeStyle = FILL_COLOR;
    ctx.lineWidth = lineWidth;
    let cx = -offset, cy = lineWidth * 2, acw = false;
    while (cy + lineWidth * 2 < height) {
      ctx.beginPath();
      cx = -offset;
      acw = false;
      while (cx - lineWidth*2 < width) {
        ctx.arc(x + cx, y + cy + lineWidth, lineWidth, Math.PI, 0, acw);
        acw = !acw; // Reverse clockwise/anticlockwise
        cx += lineWidth*2;
      }
      ctx.stroke();
      cy += lineWidth * 4;
    };
    ctx.restore();
  }

  drawDottedStrap(ctx, y, offset, height, width, dotSize) {
    while (offset > dotSize * 2) offset -= dotSize * 2;
    ctx.save();
    // Draw and crop to the strap
    let region = new Path2D();
    region.moveTo(width, y);
    region.lineTo(width, y + height);
    region.lineTo(0, y + height * 2);
    region.lineTo(0, y + height * 1);
    region.closePath();
    ctx.clip(region);
    // Draw dots
    let i = 0, cx = 0;
    ctx.beginPath();
    while (i * dotSize < height) {
      // TODO: Add offset
      // Every odd line, offset the pattern a bit
      cx = i % 2 ? dotSize / 2 : dotSize * 1.5;
      while (cx < width) {
        const dx = Math.floor(cx + offset), dy = Math.floor(y + i * dotSize*2 - offset / 2);
        if (ctx.isPointInPath(region, dx, dy)) {
          ctx.moveTo(dx, dy);
          ctx.arc(dx, dy, dotSize/2, 0, Math.PI * 2);
        }
        cx += dotSize * 2;
      }
      i++;
    }
    ctx.fill();
    ctx.restore();
  }

  drawCircles(ctx, centerX, centerY, offset, maxSize, maxLineWidth, stopLoop) {
    while (offset > maxSize) offset -= maxSize;
    // Also draw two more circles
    if (!stopLoop) {
      this.drawCircles(ctx, centerX, centerY, offset*2.5, maxSize, maxLineWidth, true);
      this.drawCircles(ctx, centerX, centerY, offset*3.5, maxSize, maxLineWidth, true);
    }
    const currentRadius = (Math.max(offset, maxSize/10)) / 2,
          // Radius will be offset or minimal - 1/10 of max
          lineWidth = maxLineWidth * (1 - currentRadius / (maxSize / 2));
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = FILL_COLOR;
    ctx.lineWidth = lineWidth;
    ctx.arc(centerX, centerY, currentRadius, 0, 2*Math.PI);
    ctx.stroke();
    ctx.restore();
  }
  
}

registerPaint('background', BackgroundPaintWorklet);