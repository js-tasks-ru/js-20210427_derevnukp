export default class SortableTable {
  element = null;
  subElements = {};
  headerConfig = [];
  headerConfigTemplate = data => `<div class="sortable-table__cell">${data}</div>`;
  data = [];
  fieldValue = "";
  orderValue = "";
  
  constructor(headerConfig = [], {data = []} = {}) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
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

  getBodyCells(rowData) {
    return this.headerConfig.map(conf => `
          ${conf.template ? conf.template(rowData[conf.id]) : this.headerConfigTemplate(rowData[conf.id])}
      `).join("");
  }

  getBodyRows() {
    return this.data.map(row => `
        <div class="sortable-table__row">
            ${this.getBodyCells(row)}
        </div>
    `);
  }

  get template() {
    return `
          <div class="sortable-table">
              <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${this.getHeaderCells()}
              </div>
              <div data-element="body" class="sortable-table__body">
                  ${this.getBodyRows()}
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
      this.subElements.header.querySelector(`[data-id='${this.fieldValue}']`)?.setAttribute("data-order", this.orderValue);
  }

  sort(fieldValue = "", orderValue = "") {
    this.fieldValue = fieldValue;
    this.orderValue = orderValue;

    const sortType = this.headerConfig.find(item => item.id == this.fieldValue)?.sortType ?? "";
    switch (sortType) {
    case "number":
      this.data.sort((a, b) => (a[this.fieldValue] > b [this.fieldValue] ? 1 : -1) * (this.orderValue == "asc" ? 1 : -1));
      break;
    case "string":
      this.data.sort((a, b) => a[this.fieldValue].localeCompare(b[this.fieldValue], ["ru-RU", "en-US"], { caseFirst: "upper"}) * (this.orderValue == "asc" ? 1 : -1));
      break;
    }
    this.update();
  }

  remove() {
    if (this.element)
      this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.headerConfig = [];
    this.data = [];
  }
};