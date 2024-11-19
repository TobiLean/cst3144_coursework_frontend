const app = new Vue({
  el: "#app",
  data: {
    lessons: [],
    cart: [],
    showLessons: true,
    page: 'home',
    sortOptions: {
      ascendingByPrice: false,
      descendingByPrice: false,
    }
  },
  methods: {
    goToCheckOut() {
      this.page = 'checkout';
      this.showLessons = !this.showLessons;
      let backHomeBtn = document.getElementsByClassName('checkout_btn');
      backHomeBtn[0].innerText = 'Back';
    },
    goToHome() {
      this.page = 'home';
      this.showLessons = !this.showLessons;
      let backHomeBtn = document.getElementsByClassName('back_home_btn');
      backHomeBtn[0].innerText = 'Checkout';
    },
    async getLessons() {
      try {
        const response = await fetch("http://localhost:8090/lessons", {
          method: 'GET',
        });
        let data = await response.json();
        let sorted
        console.log("def", this.sortOptions.ascendingByPrice)

        console.log("Got lessons successfully: ", data);
        // this.lessons = data
        if (this.sortOptions.ascendingByPrice === true) {
          console.log("func", this.sortOptions.ascendingByPrice)
          sorted = data.toSorted((a, b) => a.price - b.price);
          this.lessons = sorted
        } else {
          this.lessons = data
        }
      } catch (err) {
        console.error(err);
      }
    },
    async postOrder() {
      try {
        const form = document.getElementById("orderForm");
        const formData = new FormData(form);

        const jsonData = {};
        jsonData.cartItems = []

        // Getting each form item and adding it to json object
        formData.forEach((value, key) => {
          jsonData[key] = value;
        });

        if (this.cart.length > 0) {
          this.cart.forEach((item) => {
            jsonData.cartItems.push(item);
          })
        }

        const response = await fetch("http://localhost:8090/order", {
          method: 'POST',
          body: JSON.stringify(jsonData),
          headers: {
            'Content-Type': 'application/json',
          }
        });
        let order = await response.json();
        console.log("Test order successfully: ", order);
      } catch (err) {
        console.error(err);
      }
    },
    addToCart(index) {
      this.cart.push(this.lessons[index]);
      console.log(this.lessons[index].subject, " has been added to cart!");
    },
    removeFromCart(id) {
      let index = this.cart.findIndex(lesson => lesson.id === id);
      this.cart.splice(index, 1);
      console.log(this.lessons[index].subject + " at index " + index + " of cart has been removed from cart!");
    },
    comparePrice(a, b) {
      if (a.price < b.price) {
        return -1
      } else if (a.price > b.price) {
        return 1
      }

      return 0
    },
    sortLessons() {
      let sorted;

      if (this.sortOptions.ascendingByPrice === true) {
        console.log("func", this.sortOptions.ascendingByPrice)
        sorted = this.lessons.toSorted((a, b) => a.price - b.price);
        this.lessons = sorted
      } else if (this.sortOptions.descendingByPrice === true) {
        console.log("func", this.sortOptions.descendingByPrice)
        sorted = this.lessons.toSorted((a, b) => b.price - a.price);
        this.lessons = sorted
      }
    },
    updateAllSortingOptions() {
      Object.keys(this.sortOptions).forEach(key => {
        this.sortOptions[key] = false;
        console.log(this.sortOptions[key])
      });
    }
  },
  mounted() {
    this.getLessons();
  }
});