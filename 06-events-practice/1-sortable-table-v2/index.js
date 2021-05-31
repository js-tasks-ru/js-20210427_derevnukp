export default class SortableTable {
  element = null;
  subElements = {};
  headerConfig = [];
  headerConfigTemplate = data => `<div class="sortable-table__cell">${data}</div>`;
  data = [];
  fieldValue = "";
  orderValue = "";
  isSortLocally = true;
  
  constructor(headerConfig, {
    data = [],
    sorted = {},
    isSortLocally = true
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.fieldValue = sorted.id;
    this.orderValue = sorted.order;
    this.isSortLocally = isSortLocally;

    this.sort();
    this.render();
    this.update();
    this.initEventListeners();
  }

  getHeaderCells() {
    return this.headerConfig.map(conf => `
          <div class="sortable-table__cell" data-id="${conf.id}" data-sortable="${conf.sortable}">
              <span>${conf.title}</span>
              <span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"></span>
              </span>
          </div>
      `).join("");
  }

  getRowCells(rowData) {
    return this.headerConfig.map(conf => `
          ${conf.template ? conf.template(rowData[conf.id]) : this.headerConfigTemplate(rowData[conf.id])}
      `).join("");
  }

  getBodyRows() {
    return this.data.map(row => `
          <div class="sortable-table__row">
              ${this.getRowCells(row)}
          </div>
      `).join("");
  }

  get template() {
    return `
          <div class="sortable-table">
              <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${this.getHeaderCells()}
              </div>
              <div data-element="body" class="sortable-table__body">
              </div>
              <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
              <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                  <div>
                      <p>No products satisfies your filter criteria</p>
                      <button type="button" class="button-primary-outline">Reset all filters</button>
                  </div>
              </div>        
          </div>        
      `;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  update() {
    this.subElements.body.innerHTML = this.getBodyRows();
      this.subElements.header.querySelector("[data-order]")?.removeAttribute("data-order");
      this.subElements.header.querySelector(`[data-id='${this.fieldValue}']`).dataset.order = this.orderValue;
  }

  sortOnClient() {
    const sortType = this.headerConfig.find(item => item.id == this.fieldValue)?.sortType ?? "";
    const direction = { asc: 1, desc: -1}[this.orderValue];

    let sort;
    switch (sortType) {
    case "number":
      sort = (a, b) => a[this.fieldValue] - b [this.fieldValue] * direction;
      break;
    case "string":
      sort = (a, b) => a[this.fieldValue].localeCompare(b[this.fieldValue], ["ru-RU", "en-US"], { caseFirst: "upper"}) * direction;
      break;
    }
    this.data.sort(sort);
  }

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  headerClick = event => {
    const div = event.target.closest(".sortable-table__cell");
    if (!div || !div.dataset.sortable) return;
    this.fieldValue = div.dataset.id;
    this.orderValue = this.orderValue === "asc" ? "desc" : "asc";
      
    this.sort();
    this.update();
  }

  initEventListeners () {
    this.subElements.header.addEventListener("pointerdown", this.headerClick);
  }

  remove() {
      this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}