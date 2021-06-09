import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
    element = null;
    subElements = {};
    defaultFormData = {
      title: "",
      description: "",
      images: {},
      quantity: 1,
      subcategory: "",
      status: 1,
      price: 100,
      discount: 0
    };

    constructor (productId) {
      this.productId = productId;
      this.urlCategories = "api/rest/categories";
      this.urlProduct = "api/rest/products";
      this.categories = [];
      this.product = {};
    }

    getItemImage(image) {
      return `
            <li class="products-edit__imagelist-item sortable-list__item" style="">
                <input data-element="url" type="hidden" name="url" value="${image.url}">
                <input data-element="source" type="hidden" name="source" value="${image.source}">
                <span>
                    <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                    <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
                    <span>${image.source}</span>
                </span>
                <button type="button">
                    <img src="icon-trash.svg" data-delete-handle="" alt="delete">
                </button>
            </li>
        `;
    }

    get template() {
      return `
            <div class="product-form">
                <form data-element="productForm" class="form-grid">
                <div class="form-group form-group__half_left">
                    <fieldset>
                        <label class="form-label">Название товара</label>
                        <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
                    </fieldset>
                </div>
                <div class="form-group form-group__wide">
                    <label class="form-label">Описание</label>
                    <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
                </div>
                <div class="form-group form-group__wide" data-element="sortable-list-container">
                    <label class="form-label">Фото</label>
                    <div data-element="imageListContainer">
                        <ul class="sortable-list">
                            <!-- Список фото -->
                        </ul>
                    </div>
                    <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
                    <input name="fileInput" data-element="fileInput" type="file" style="display:none;" />
                </div>
                <div class="form-group form-group__half_left">
                    <label class="form-label">Категория</label>
                    <select class="form-control" name="subcategory" id="subcategory">
                        <!-- Список категорий -->
                    </select>
                </div>
                <div class="form-group form-group__half_left form-group__two-col">
                    <fieldset>
                        <label class="form-label">Цена ($)</label>
                        <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
                    </fieldset>
                    <fieldset>
                        <label class="form-label">Скидка ($)</label>
                        <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
                    </fieldset>
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Количество</label>
                    <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Статус</label>
                    <select class="form-control" name="status" id="status">
                        <option value="1">Активен</option>
                        <option value="0">Неактивен</option>
                    </select>
                </div>
                <div class="form-buttons">
                    <button type="submit" name="save" class="button-primary-outline">
                        Сохранить товар
                    </button>
                </div>
                </form>
            </div>
        `;
    }

    getProduct(id) {
      const url = new URL(this.urlProduct, BACKEND_URL);
      url.searchParams.append("id", id);
      return fetchJson(url);
    }

    getCategories() {
      const url = new URL(this.urlCategories, BACKEND_URL);
      url.searchParams.append("_sort", "weight");
      url.searchParams.append("_refs", "subcategory");
      return fetchJson(url);
    }

    async render () {
      const promiseCategories = this.getCategories();
      const promiseProduct = this.productId ? this.getProduct(this.productId) : [this.defaultFormData];
      const [categories, productResponce] = await Promise.all([promiseCategories, promiseProduct]);
      this.categories = categories;
      [this.product] = productResponce;

      const element = document.createElement("div");
      element.innerHTML = this.template;
      this.element = element.firstElementChild;
      this.subElements = this.getSubElements(this.element);
        
      if (this.product) {
        this.setFormData(this.product);
        this.initEventListeners();
      }

      return this.element;
    }

    setFormData(product) {
      this.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          const isSelected = product.subcategory === subcategory.id;
          const option = new Option(`${category.title} > ${subcategory.title}`, subcategory.id, isSelected, isSelected);
          this.subElements.productForm.elements.subcategory.append(option);
        });
      });

      const listImages = this.subElements.productForm.querySelector(".sortable-list");
      listImages.innerHTML = "";
      product.images.forEach(image => {
        listImages.innerHTML += this.getItemImage(image);
      });

      const excludeFields = ["images"];
      const formFields = Object.keys(this.defaultFormData).filter(key => !excludeFields.includes(key));
      formFields.forEach(field => {
        const element = this.subElements.productForm.elements[field];
        if (element) {
          element.value = product[field];
        }
      });
    }

    getFormData() {
      const product = {
        id: this.productId
      };
      const excludeFields = ["images"];
      const numberFields = ["quantity", "status", "price", "discount"];
      const formFields = Object.keys(this.defaultFormData).filter(key => !excludeFields.includes(key));
      formFields.forEach(field => {
        const element = this.subElements.productForm.elements[field];
        if (element) {
          product[field] = numberFields.includes(field) ?
            parseInt(element.value):
            element.value;
        }
      });
        
      const listImages = [...this.subElements.productForm.querySelectorAll(".sortable-list li")];
      product.images = listImages.map(image => ({
        url: image.children.url.value,
        source: image.children.source.value
      }));

      return product;
    }

    initEventListeners () {
      const {productForm, uploadImage, fileInput} = this.subElements;
      productForm.addEventListener("submit", this.onSubmit);
      uploadImage.addEventListener("click", this.uploadImageClick);
      fileInput.addEventListener("change", this.fileInputChange);
    }

    uploadImageClick = () => {
      this.subElements.fileInput.click();
    }

    fileInputChange = async () => {
      this.subElements.uploadImage.disabled = true;
      this.subElements.uploadImage.classList.add("is-loading");
      const [file] = this.subElements.fileInput.files;
      const fileUploaded = await this.uploadFile(file);
      if (fileUploaded) {
        const listImages = this.subElements.productForm.querySelector(".sortable-list");
        listImages.innerHTML += this.getItemImage({source: file.name, url: fileUploaded.link});
      }
      this.subElements.uploadImage.classList.remove("is-loading");
      this.subElements.uploadImage.disabled = false;
    }

    async uploadFile(file) {
      const formData = new FormData();
      formData.append("image", file);
        
      try {
        const response = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData
        });

        return response.data;
      }
      catch (error) {
        throw error;
      }
    }

    onSubmit = (event) => {
      event.preventDefault();

      this.save();
    }

    async save() {
      const product = this.getFormData();
      const url = new URL(this.urlProduct, BACKEND_URL);
      const method = this.productId ? "PATCH" : "PUT";
      try {        
        const result = fetchJson(url, {
          method: method,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(product)
        });

        const event = this.productId ?
          new CustomEvent("product-updated", {
            detail: result.id
          }) :
          new CustomEvent("product-saved");
        this.element.dispatchEvent(event);
      }
      catch (error) {
        throw error;
      }
    }

    getSubElements(element) {
      const elements = element.querySelectorAll("[data-element]");

      return [...elements].reduce((accum, subElement) => {
        accum[subElement.dataset.element] = subElement;

        return accum;
      }, {});
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