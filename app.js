// using contentful to load content
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "x346lwe53vz1",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "Do9vg_0n7rcA0xkoAb3PbSb5KThgzFFEfT_Fvr1WNss",
});

// VARAIBLES
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const buyCartBtn = document.querySelector(".buy-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const productConfirmation = document.querySelector(".product-confirmation");
//cart
let cart = [];
let buttonsDOM = [];

// getting the product
class Products {
  // async function always returns a promis
  async getProducts() {
    try {
      // getting data from contentful
      let contentful = await client.getEntries({
        content_type: "comfyHouse",
      });

      // local storage data
      //let result = await fetch("products.json"); //fetch always returns a promise  wrapped in response object
      //let data = await result.json(); // await makes the whole code below it untill its execution completes
      // let products = data.items;

      let products = contentful.items;
      console.log(products);
      products = products.map((item) => {
        // destructuring data
        const { title, price } = item.fields;
        const { id } = item.sys;
        const { url: image } = item.fields.image.fields.file;
        return { title, price, id, image };
      });
      // products is returned as a promise
      return products;
    } catch (error) {
      console.log("ERROR:" + error);
    }
  }
}

// display the product
class UI {
  displayProducts(products) {
    let result = "";
    //single product adding dynamically
    products.forEach((product) => {
      result += `
      <article class="product">
          <div class="img-container">
            <img src= ${product.image} alt="" class="product-img" />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$ ${product.price}</h4>
        </article>
      `;
      //single product end adding dynamically
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    // getting all the product buttons
    // converting nodelist to array using spread operator because find, filter, slice like methods only works on array
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    //looping over each button and setting the logics
    buttons.forEach((button) => {
      // getting button id , the button id and product id are always same in value
      let id = button.dataset.id;
      // finding if item is present in the cart
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        // if item is present change inner text and button functionality to disabled
        button.innerText = "In Cart";
        button.style.pointerEvents = "none";
      } else {
        // if not present add click event listner and set button functionality to true
        button.addEventListener("click", (event) => {
          console.log("clicked");
          event.target.innerText = "In Cart";
          button.style.pointerEvents = "none";
          // get product form local storage
          let cartItem = { ...Storage.getProducts(id), amount: 1 };
          // add product to the cart
          cart = [...cart, cartItem];
          // save cart in the local storage
          Storage.saveCart(cart);
          // set cart values and calculate the total
          this.setCartValues(cart);
          //display cart items
          this.addCartItem(cartItem);
          //product ConfirmationAlert
          this.productAlert();
        });
      }
    });
  }
  productAlert() {
    const topHeight = (scrollY + 650).toString() + "px";
    productConfirmation.style.top = topHeight;
    productConfirmation.classList.add("show-confirmation");
    setTimeout(
      () => productConfirmation.classList.remove("show-confirmation"),
      1200
    );
  }
  // it will take all the products in cart
  setCartValues(cart) {
    //total items in cart
    let itemTotal = 0;
    //total amount
    let tempTotal = 0;
    //loop over to calculate
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemTotal += item.amount;
    });
    //setting values upto 2 decimals
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemTotal;
  }
  //adding cart items
  addCartItem(item) {
    const cartDiv = document.createElement("div");
    cartDiv.classList.add("cart-item");
    cartDiv.innerHTML = `
    <img src=${item.image} alt="" />
            <div>
              <h4>${item.title}</h4>
              <h5> $ ${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
          </div>
    `;
    cartContent.appendChild(cartDiv);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  // function that will set all the things from local storage when the website will load
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    // populate the cart
    this.populateCart(cart);
    // adding event listener to cart button
    cartBtn.addEventListener("click", this.showCart);
    // hide cart
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  // adding items to cart from cart array stored in local storage
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  // all the cart logic
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      // clearing all the products
      this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        this.removeItem(id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id); // the value that find gives is refrenced to the original value.. it means any change in temp cart will reflect in original cart array
        tempItem.amount++;
        console.log(cart);
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id); // the value that find gives is refrenced to the original value.. it means any change in temp cart will reflect in original cart array
        tempItem.amount--;
        if (tempItem.amount < 1) {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
        console.log(cart);
        Storage.saveCart(cart);
        this.setCartValues(cart);
        lowerAmount.previousElementSibling.innerText = tempItem.amount;
      }
    });
  }
  clearCart() {
    //looping over all the products inside cart to return product id and storing in an array that will be used to remove it
    let cartItems = cart.map((item) => item.id);
    // passing array of id to removeItem function
    cartItems.forEach((id) => this.removeItem(id));
    //deleting all the elements from cart
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }
  // this will take id of product to remove it and it will further update our local storage, cart calculations and product button text
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id); // filter return array
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.style.pointerEvents = "auto";
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  // getting button by button id
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id); // find return value
  }
  buyCart() {
    buyCartBtn.addEventListener("click", () => {
      alert("Fucntionality to be added");
    });
  }
}
// local storage
class Storage {
  // all products will be saved in local storage
  // static keywords allows to use the function outside the class by prepending the class name
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  //getting desired product from local storage by id
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  //saving cart
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  //getting cart
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}
//DOMcontentLoaded means the eventListner will wait only for html to load completely and adter that it will run (without waiting for stylesheets)
const ui = new UI();
const products = new Products();
ui.setupAPP();
products
  .getProducts()
  //.then is used because async function returns promise
  .then((products) => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
  })
  .then(() => {
    ui.getBagButtons();
    ui.cartLogic();
    ui.buyCart();
  });
