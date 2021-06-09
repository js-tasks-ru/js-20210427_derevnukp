import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
    element = null;
    subElements = {};
    headersConfigTemplate = data => `<div class="sortable-table__cell">${data}</div>`;
    page = 0;
    pageSize = 30;
    isFull = false;
    isLoadingData = false;
    
    constructor(headersConfig, {
        data = [],
        sorted = {
            id: headersConfig.find(item => item.sortable).id,
            order: "asc"
        },
        url = "",
        isSortLocally = !url
    } = {}) {
        this.headersConfig = headersConfig;
        this.data = data;
        this.sorted = sorted;
        this.url = url;
        this.isSortLocally = isSortLocally;
    
        this.render();
    }

    getHeaderSortingArrow (id) {
        const isOrderExist = this.sorted.id === id ? this.sorted.order : "";
    
        return isOrderExist ?
            `<span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>`
            : "";
    }

    getHeaderCells() {
        return this.headersConfig.map(conf => `
            <div class="sortable-table__cell" data-id="${conf.id}" ${conf.sortable ? "data-sortable=\"true\"" : ""} data-order="${this.sorted.order}">
                <span>${conf.title}</span>
                ${this.getHeaderSortingArrow(conf.id)}
            </div>
        `).join("");
    }

    getRowCells(rowData) {
        return this.headersConfig.map(conf => `
            ${conf.template ? conf.template(rowData[conf.id]) : this.headersConfigTemplate(rowData[conf.id])}
        `).join("");
    }

    getBodyRows(data) {
        return data.map(row => `
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

    async render() {
        const element = document.createElement("div");
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        await this.loadingData(this.sorted.id, this.sorted.order);
        this.initEventListeners();
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }

    refreshRows(data) {
        this.subElements.body.innerHTML = this.getBodyRows(data);
    }

    appendRows(data) {
        this.subElements.body.innerHTML += this.getBodyRows(data);
    }

    sortOnClient(id, order) {
        const {sortType, customSorting} = this.headersConfig.find(item => item.id === id);
        const direction = { asc: 1, desc: -1}[order];

        let sort;
        switch (sortType) {
            case "number":
                sort = (a, b) => direction * (a[id] - b [id]);
                break;
            case "string":
                sort = (a, b) => direction * a[id].localeCompare(b[id], ["ru-RU", "en-US"], { caseFirst: "upper"});
                break;
            case "custom":
                sort = (a, b) => direction * customSorting(a, b);
            default:
                sort = (a, b) => direction * (a[id] - b[id]);
        }
        this.data.sort(sort);
        this.refreshRows(this.data);
    }

    sortOnServer(id, order) {
        this.page = 0;
        this.isFull = false;
        this.data = [];
        this.refreshRows(this.data);
        this.loadingData(id, order);
    }

    headerClick = event => {
        const cell = event.target.closest("[data-sortable='true']");
        if (!cell) {return;}

        const toggleOrder = order => {
            const orders = {
                asc: "desc",
                desc: "asc"
            };
      
            return orders[order];
        };
        this.sorted.id = cell.dataset.id;
        this.sorted.order = toggleOrder(this.sorted.order);
        if (this.isSortLocally) {
            this.sortOnClient(this.sorted.id, this.sorted.order);
        }
        else {
            this.sortOnServer(this.sorted.id, this.sorted.order);
        }
        
        const arrow = cell.querySelector(".sortable-table__sort-arrow");
        cell.dataset.order = this.sorted.order;
        if (!arrow) {
            cell.append(this.subElements.arrow);
        }
    }

    //Получаем порцию данных с сервера
    async getDataFromServer(sort, order, start, end) {
        let url = new URL(this.url, BACKEND_URL);
        url.searchParams.append("_sort", sort);
        url.searchParams.append("_order", order);
        url.searchParams.append("_start", start);
        url.searchParams.append("_end", end);
        const data = await fetchJson(url);
        return data;
    }

    //Выполняем процедуру подгрузки данных с сервера
    async loadingData(id, order) {
        this.subElements.loading.style.display = "grid";
        const data = await this.getDataFromServer(id, order, this.page * this.pageSize, (this.page + 1) * this.pageSize);
        if (data.length) {
            this.page++;
            this.data = [...this.data, ...data];
            this.appendRows(data);
        }
        else {
            this.isFull = true;
            
            if (!this.data.length) {
                this.subElements.emptyPlaceholder.style.display = "block";
            }
        }
        this.subElements.loading.style.display = "none";
        this.isLoadingData = false;
    }

    windowScroll = async () => {
        let documentBottom = document.documentElement.getBoundingClientRect().bottom;
        if (documentBottom > document.documentElement.clientHeight + 100) {return;}
        if (this.isFull || this.isLoadingData) {return;}

        this.isLoadingData = true;
        await this.loadingData(this.sorted.id, this.sorted.order);
    }

    initEventListeners () {
        this.subElements.header.addEventListener("pointerdown", this.headerClick);
        window.addEventListener("scroll", this.windowScroll);
    }

    remove() {
        this.element?.remove();
    }

    destroy() {
        window.removeEventListener("scroll", this.windowScroll);
        this.remove();
        this.element = null;
        this.subElements = {};
    }
}