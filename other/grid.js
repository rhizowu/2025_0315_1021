const tools = {
    drawPath(ctx, fn) {
      ctx.save();
      ctx.beginPath();
      fn();
      ctx.closePath();
      ctx.restore();
    },
    easing(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    cellEasing(t, b, c, d, s) {
      return c * (t /= d) * t * t * t + b;
    } };
  
  const doc = {
    height: 0,
    width: 0 };
  
  const plane = {
    xCell: 0,
    yCell: 0,
    cells: [] };
  
  const context = {
    plane: null };
  
  const cfg = {
    cell: 35,
    sectionWidth: 8,
    sectionHeight: 1,
    numberOffset: 5,
    shadowBlur: true,
    bgColor: '#ffffff' };
  
  const ui = {
    plane: '#gird-canvas'
   };
  
  class App {
    constructor() {
      this.state = {
        area: 0,
        time: Date.now(),
        planeProgress: 0,
        stepOffset: 0,
        delta: 0,
        dlt: performance.now(),
        needRedraw: true };
  
      this.bindNodes();
      this.getDimensions();
      this.start();
    }
    start() {
      this.initEvents();
      this.canvasInit();
      this.loop();
    }
    getDimensions() {
      doc.height = document.documentElement.clientHeight;
      doc.width = document.documentElement.clientWidth;
    }
    updatePlane() {
  
      const { width: w, height: h } = doc;
  
      const cell = Math.round(w / cfg.cell);
  
      const xPreSize = w / cell;
      plane.xCell = w / xPreSize % 2 !== 0 ? w / (w / xPreSize + 1) : xPreSize;
  
      const yPreSize = h / Math.round(cell * (h / w));
      plane.yCell = h / yPreSize % 2 !== 0 ? h / (h / yPreSize + 1) : yPreSize;
  
      plane.cells = [Math.round(w / plane.xCell), Math.round(h / plane.yCell)];
      plane.xCenter = Math.round(plane.cells[1] / 2);
      plane.yCenter = Math.round(plane.cells[0] / 2);
      plane.centerCoords = [plane.yCenter * plane.xCell, plane.xCenter * plane.yCell];
  
    }
    bindNodes() {
      for (const selector in ui) {
        ui[selector] = document.querySelectorAll(ui[selector]);
        if (ui[selector].length === 1) ui[selector] = ui[selector][0];
      }
    }
    canvasInit() {
      context.plane = ui.plane.getContext('2d');
    }
    initEvents() {
  
      window.addEventListener('resize', e => {
        this.getDimensions();
        this.resizeHandler(e);
      });
      this.resizeHandler();
  
    }
    resizeHandler(e) {
      const state = this.state;
      state.area = doc.width * doc.height / 1000000;
      ui.plane.height = doc.height;
      ui.plane.width = doc.width;
      this.updatePlane();
      state.needRedraw = true;
    }
    loop() {
      const loop = () => {
        this.updateState();
        this.raf = requestAnimationFrame(loop);
        this.drawPlane();
      };
      loop();
    }
    updateState() {
      const state = this.state;
      const now = performance.now();
      state.delta = now - state.dlt;
      state.dlt = now;
      const dt = state.delta;
  
      //state.planeProgress += 0.00035 * dt;
      state.planeProgress += 1 * dt;
          if (state.planeProgress >= 1) state.planeProgress = 1; 
    }
    drawPlaneCenterLines(props) {
      const { p } = props;
      const ctx = context.plane;
      const {
        centerCoords
       } =
      plane;
      tools.drawPath(ctx, () => {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + (1 - p) * 1})`;
        ctx.fillRect(centerCoords[0], 0 + doc.height / 2 * (1 - p), 1, doc.height * p);
        ctx.fillRect(0 + doc.width / 2 * (1 - p), centerCoords[1], doc.width * p, 1);
      });
    }
    drawYLines(props) {
      const { i, cp, p, x } = props;
      const ctx = context.plane;
      const {
        yCenter } =
      plane;
      const percent = 1 / yCenter;
      const pos = Math.abs(i - yCenter);
      const point = percent * pos;
      let f = cp * (cp / point);
      if (f >= 1) f = 1;
      const ef = tools.cellEasing(f, 0, 1, 1);
      if (i) {
        tools.drawPath(ctx, () => {
          ctx.fillStyle = `rgba(255,255,255,${0.07 + (1 - p) * 0.35})`;
          ctx.fillRect(x, 0 + doc.height / 2 * (1 - ef), 1, doc.height * ef);
        });
      }
    }
    drawYMarkup(props) {
      const ctx = context.plane;
      const state = this.state;
      let { i, p, cp, x, y } = props;
      const {
        yCenter } =
      plane;
      const percent = 1 / yCenter;
      const pos = Math.abs(i - yCenter);
      const point = percent * pos;
      const conds = [p >= point, p <= point + percent];
      let f = cp * (cp / point);
      if (f >= 1) f = 1;
      const f2 = conds[0] && conds[1] ? (p - point) / percent : conds[0] ? 1 : 0;
  
      const text = i - yCenter + '';
      ctx.fillStyle = `rgba(255,255,255,${0.3 + (1 - f) * 0.75})`;
      const textCoords = [x - ctx.measureText(text).width / 2, y + cfg.sectionWidth / 2 + cfg.numberOffset];
      tools.drawPath(ctx, () => {
        const o = (1 - f2) * 50;
        ctx.globalAlpha = f2;
        ctx.fillRect(x, y - cfg.sectionWidth / 2 + o, cfg.sectionHeight, cfg.sectionWidth);
      });
      tools.drawPath(ctx, () => {
        ctx.globalAlpha = f2;
        ctx.textBaseline = 'top';
        ctx.fillText(
        text,
        textCoords[0],
        textCoords[1] + (1 - f2) * -20);
  
      });
    }
    drawXLines(props) {
      const ctx = context.plane;
      const { i2, cp, p, y } = props;
      const {
        xCenter } =
      plane;
      const percent = 1 / xCenter;
      const pos = Math.abs(i2 - xCenter);
      const point = percent * pos;
      let f = cp * (cp / point);
      if (f >= 1) f = 1;
      const ef = tools.cellEasing(f, 0, 1, 1);
      if (i2) {
        tools.drawPath(ctx, () => {
          ctx.fillStyle = `rgba(255,255,255,${0.07 + (1 - p) * 0.35})`;
          ctx.fillRect(0 + doc.width / 2 * (1 - ef), y, doc.width * ef, 1);
        });
      }
    }
    drawXMarkup(props) {
      const ctx = context.plane;
      const state = this.state;
      let { i2, p, cp, x, y } = props;
      const {
        xCenter } =
      plane;
  
      const percent = 1 / xCenter;
      const pos = Math.abs(i2 - xCenter);
      const point = percent * pos;
      const conds = [p >= point, p <= point + percent];
      let f = cp * (cp / point);
      if (f >= 1) f = 1;
      let f2 = conds[0] && conds[1] ? (p - point) / percent : conds[0] ? 1 : 0;
  
      ctx.fillStyle = `rgba(255,255,255,${0.1 + (1 - f) * 0.75})`;
      tools.drawPath(ctx, () => {
        const o = (1 - f2) * 50;
        ctx.globalAlpha = f2;
        ctx.fillRect(x - cfg.sectionWidth / 2 + o, y, cfg.sectionWidth, cfg.sectionHeight);
      });
      tools.drawPath(ctx, () => {
        ctx.globalAlpha = f2;
        ctx.textBaseline = 'middle';
        const textCoords = [x + cfg.sectionWidth / 2 + cfg.numberOffset, y + cfg.sectionHeight / 2];
        ctx.fillText(
        xCenter - i2 + '',
        textCoords[0] + (1 - f2) * -20,
        textCoords[1]);
  
      });
    }
    drawPlane() {
  
      const state = this.state;
      const ctx = context.plane;
  
      ctx.clearRect(0, 0, doc.width, doc.height);
  
      const {
        xCell,
        yCell,
        xCenter,
        yCenter,
        cells } =
      plane;
  
      const p = tools.easing(state.planeProgress, 0, 1, 1);
      const cp = state.planeProgress;
      const dp = state.dotsProgress;
  
      this.drawPlaneCenterLines({ p });
  
      for (let i = 0; i < cells[0]; i++) {
        for (let i2 = 0; i2 < cells[1]; i2++) {
  
          const x = i * xCell;
          const y = i2 * yCell;
  
          if (i2 === xCenter && i !== yCenter) {
            this.drawYLines({ i, i2, p, cp, x, y });
            //this.drawYMarkup({ i, p, cp, x, y });
          }
          if (i2 !== xCenter && i === yCenter) {
            this.drawXLines({ i, i2, p, cp, x, y });
            //this.drawXMarkup({ i2, p, cp, x, y });
          }
        }
      }
  
    }
  }
  
  window.addEventListener('load', () => {
    window.app = new App();
  });