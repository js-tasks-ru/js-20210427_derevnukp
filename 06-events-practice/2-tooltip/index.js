class Tooltip {
    static instance = null;
    element = null;

    constructor() {
      if (Tooltip.instance) {return Tooltip.instance;}
      Tooltip.instance = this;
    }

    get template() {
      return `<div class="tooltip"></div>`;
    }

    initialize() {
      this.initEventListeners();
    }

    render(message) {
      let element = document.createElement("div");
      element.innerHTML = this.template;
      this.element = element.firstElementChild;
      this.element.innerHTML = message;
      document.body.append(this.element);
    }

    move(x = 0, y = 0) {
      const shift = 5;
      this.element.style.left = x + shift + "px";
      this.element.style.top = y + shift + "px";
    }

    hide() {
      this.remove();
      this.element = null;
    }

    showToolTip = event => {
      if (!event.target.dataset || !event.target.dataset.tooltip) {return;}

      this.render(event.target.dataset.tooltip);
      event.target.addEventListener("pointermove", this.moveToolTip);
      event.target.addEventListener("pointerout", this.hideToolTip);
    }

    moveToolTip = event => {
      if (!event.target.dataset || !event.target.dataset.tooltip) {return;}

      this.move(event.clientX, event.clientY);
    }

    hideToolTip = event => {
      if (!event.target.dataset || !event.target.dataset.tooltip) {return;}

      this.hide();
      event.target.removeEventListener("pointermove", this.moveToolTip);
      event.target.removeEventListener("pointerout", this.hideToolTip);
    }

    initEventListeners() {
      document.addEventListener("pointerover", this.showToolTip);
    }

    remove() {
        this.element?.remove();
    }

    destroy() {
      document.removeEventListener("pointerover", this.showToolTip);
      this.remove();
      this.element = null;
    }
}

export default Tooltip;