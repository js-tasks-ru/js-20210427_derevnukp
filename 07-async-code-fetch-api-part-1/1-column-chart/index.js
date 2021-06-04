import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    element = null;
    subElements = {};
    params = {};
    chartHeight = 50;
    

    constructor({
      url = "",
      range = {
        from: new Date(),
        to: new Date(),
      },
      data = [],
      label = "",
      link = "",
      value = 0,
      formatHeading = data => `${data}`
    } = {}) {
      this.params = {
        url: url,
        range: {
          from: range.from,
          to: range.to
        },
        data: data, 
        label: label, 
        link: link, 
        value: value, 
        formatHeading: formatHeading
      };
      this.render();
      this.refresh(data);
    }

    get template() {
      return `
            <div class="column-chart ${!this.params.data.length ? `column-chart_loading` : ``}" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    Total ${this.params.label}
                    ${this.params.link ? `<a href="${this.params.link}" class="column-chart__link">View all</a>` : ``}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">${this.params.formatHeading(this.params.value.toLocaleString())}</div>
                    <div data-element="body" class="column-chart__chart">
                    </div>
                </div>
            </div>
        `;
    }
    
    render() {
      this.element = document.createElement('div');
      this.element.innerHTML = this.template;
      this.element = this.element.firstElementChild;
      this.subElements = this.getSubElements(this.element);
    }
    
    refresh(data) {
      const dataValues = Object.values(data);
      if (dataValues.length) this.element.classList.remove("column-chart_loading");
      let columnsHTML = this.getColumnProps(dataValues).map(
        prop => `<div style="--value: ${prop.value}" data-tooltip="${prop.percent}"></div>`
      ).join("");
      this.subElements.body.innerHTML = columnsHTML;
      this.subElements.header.innerHTML = dataValues.reduce((sum, item) => { sum += item; return sum;}, 0);
    }

    async getData(from, to) {
      let url = new URL(this.params.url, BACKEND_URL);
      url.searchParams.append("from", from.toJSON());
      url.searchParams.append("to", to.toJSON());
      return await fetchJson(url);
    }

    async update(from, to) {
      this.element.classList.add("column-chart_loading");        
      const data = await this.getData(from, to);
      this.refresh(data);
      return data;
    }

    remove () {
        this.element?.remove();
    }
    
    destroy() {
      this.remove();
      this.element = null;
      this.subElements = {};
    }

    getColumnProps(data) {
      const maxValue = Math.max(...data);
      const scale = this.chartHeight / maxValue;
      
      return data.map(item => {
        return {
          percent: (item / maxValue * 100).toFixed(0) + '%',
          value: String(Math.floor(item * scale))
        };
      });
    }

    getSubElements(element) {
      const elements = element.querySelectorAll('[data-element]');

      return [...elements].reduce((accum, subElement) => {
        accum[subElement.dataset.element] = subElement;

        return accum;
      }, {});
    }
}