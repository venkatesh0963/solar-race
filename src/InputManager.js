export default class InputManager {
  constructor() {
    this.keys = {
      ArrowLeft: false,
      ArrowRight: false,
      KeyA: false,
      KeyD: false,
      ArrowUp: false,
      ArrowDown: false,
      KeyW: false,
      KeyS: false
    };

    this.touchLeft = false;
    this.touchRight = false;
    this.touchUp = false;
    this.touchDown = false;

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = false;
      }
    });

    // Touch Listeners (Mobile D-Pad)
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');

    if (btnLeft) {
      btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchLeft = true; });
      btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.touchLeft = false; });
      btnLeft.addEventListener('mousedown', () => { this.touchLeft = true; });
      btnLeft.addEventListener('mouseup', () => { this.touchLeft = false; });
      btnLeft.addEventListener('mouseleave', () => { this.touchLeft = false; });
    }
    if (btnRight) {
      btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchRight = true; });
      btnRight.addEventListener('touchend', (e) => { e.preventDefault(); this.touchRight = false; });
      btnRight.addEventListener('mousedown', () => { this.touchRight = true; });
      btnRight.addEventListener('mouseup', () => { this.touchRight = false; });
      btnRight.addEventListener('mouseleave', () => { this.touchRight = false; });
    }
    if (btnUp) {
      btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchUp = true; });
      btnUp.addEventListener('touchend', (e) => { e.preventDefault(); this.touchUp = false; });
      btnUp.addEventListener('mousedown', () => { this.touchUp = true; });
      btnUp.addEventListener('mouseup', () => { this.touchUp = false; });
      btnUp.addEventListener('mouseleave', () => { this.touchUp = false; });
    }
    if (btnDown) {
      btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchDown = true; });
      btnDown.addEventListener('touchend', (e) => { e.preventDefault(); this.touchDown = false; });
      btnDown.addEventListener('mousedown', () => { this.touchDown = true; });
      btnDown.addEventListener('mouseup', () => { this.touchDown = false; });
      btnDown.addEventListener('mouseleave', () => { this.touchDown = false; });
    }
  }

  getHorizontalAxis() {
    let axis = 0;
    if (this.keys.ArrowLeft || this.keys.KeyA || this.touchLeft) axis -= 1;
    if (this.keys.ArrowRight || this.keys.KeyD || this.touchRight) axis += 1;
    return axis;
  }

  getVerticalAxis() {
    let axis = 0;
    if (this.keys.ArrowDown || this.keys.KeyS || this.touchDown) axis -= 1;
    if (this.keys.ArrowUp || this.keys.KeyW || this.touchUp) axis += 1;
    return axis;
  }
}
