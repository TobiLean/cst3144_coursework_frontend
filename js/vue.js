const app = new Vue({
  el: "#app",
  data: {
    lessons: [],
    cart: [],
    searchResults: [],
    showLessons: true,
    showSearchResults: false,
    page: 'home',
    sortOptions: {
      ascendingByPrice: false,
      descendingByPrice: false,
      ascendingByLocation: false,
      descendingByLocation: false,
      ascendingBySubject: false,
      descendingBySubject: false,
      ascendingBySpaces: false,
      descendingBySpaces: false,
    },
    nameField: "",
    emailField: "",
    phoneField: "",
    searchString: "",
    displayedValues: new Set()
  },
  watch: {
    searchString() {
      //searching on search input change
      this.searchToUrl();
    },
    searchResults: {
      handler() {
        //Handler to avoid repetitive search suggestions
        this.displayedValues.clear();
      },
      deep: true
    }
  },
  computed: {
    /**
     * Check if back button should be disabled
     * */
    isDisabledBackButton() {
      //change back button disabled status
      if (this.page !== 'home') {
        return false;
      } else if (this.cart.length == 0) {
        return true;
      } else if (this.cart.length > 0) {
        return false;
      }

      return true;
    },
    /**
     * Check if proceed button should be disabled
     * */
    isDisabledProceedButton() {
      //change proceed button disabled status
      if (this.hasOnlyLetters(this.nameField) && this.isValidEmail(this.emailField) && this.hasOnlyNumbers(this.phoneField)) {
        return false;
      } else {
        return true;
      }

    }
  },
  methods: {
    /**
     * Capitalize first letter of a string
     * @param {string} string
     * @return {string}
     * */
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    /**
     * Checks if string has only alphabetical letters. Ignores whitespaces
     * @param {string} string
     * @return {boolean}
     * */
    hasOnlyLetters(string) {
      let regex = /^[A-Za-z\s]+$/;
      return regex.test(string);
    },
    /**
     * Checks if string is a valid email format
     * @param {string} email
     * @return {boolean}
     * */
    isValidEmail(email) {
      //function to check if email is valid
      let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      return regex.test(email);
    },
    /**
     * Checks if string has only numbers.
     * @param {string} num
     * @return {boolean}
     * */
    hasOnlyNumbers(num) {
      //function to check if string only contains digits
      let regex = /^[0-9]+$/;
      return regex.test(num);
    },
    /**
     * Function to go to checkout page.
     * */
    goToCheckOut() {
      this.page = 'cart';
      this.showLessons = !this.showLessons;
      let backHomeBtn = document.getElementsByClassName('checkout_btn');
      backHomeBtn[0].innerText = 'Back';
      this.showSearchResults = false
    },
    /**
     * Function to go to home page
     * */
    goToHome() {
      this.page = 'home';
      this.showLessons = !this.showLessons;
      let backHomeBtn = document.getElementsByClassName('back_home_btn');
      backHomeBtn[0].innerText = 'Cart';
      this.showSearchResults = false
    },
    /**
     * Function to fetch lessons from server and set it in lessons array
     * @return {Promise<Array>}
     * */
    async getLessons() {
      try {
        const response = await fetch("https://cst3144-coursework.onrender.com/lessons", {
          method: 'GET',
        });
        let data = await response.json();
        let sorted
        console.log("def", this.sortOptions.ascendingByPrice)

        console.log("Got lessons successfully: ", data);

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
    /**
     * Function to send order to server and update in cartItems array
     * */
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
            this.updateLesson(item);
          })
        }

        const response = await fetch("https://cst3144-coursework.onrender.com/order", {
          method: 'POST',
          body: JSON.stringify(jsonData),
          headers: {
            'Content-Type': 'application/json',
          }
        });
        let order = await response.json();
        console.log("Test order successfully: ", order);
        alert('Created new order!')
      } catch (err) {
        console.error(err);
      }
    },
    /**
     * Function to send order to backend to update lesson spaces on database
     * @param {object} lesson
     * */
    async updateLesson(lesson) {
      //function to update lesson in the database after making an order
      console.log(lesson)
      try {
        const response = await fetch("https://cst3144-coursework.onrender.com/update", {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lesson),
        });

        let updatedLesson = await response.json();

      } catch (err) {
        console.error(err, " could not update lesson");
      }
    },
    /**
     * Function to add lesson to cart
     * @param {number} index
     * */
    addToCart(index) {
      //check if there are available spaces in the lesson before adding to cart
      if (this.lessons[index].spaces > 0) {
        if (this.lessons[index].bookedSpaces >= 0) {
          this.lessons[index].bookedSpaces += 1
          this.lessons[index].spaces -= 1

          if (this.lessons[index].bookedSpaces == 1) {
            this.cart.push(this.lessons[index]);
            console.log(this.lessons[index].subject, " has been added to cart!");
          }

          let cartIndex = this.cart.findIndex(lesson => lesson.id === this.lessons[index].id);
          console.log("cart id: ", this.cart[cartIndex].id);
          console.log("lesson id: ", this.lessons[index].id);

          if (this.lessons[index].bookedSpaces > 1) {
            console.log("Lesson already in cart, will increment booked spaces if there are still available spaces")
            this.cart[cartIndex].bookedSpaces = this.lessons[index].bookedSpaces;
          }

          console.log("There are " + this.lessons[index].bookedSpaces + " booked spaces in after adding to cart")
          console.log("There are " + this.lessons[index].spaces + "  spaces left in after adding to cart")
        } else {
          this.lessons[index].bookedSpaces = 1;
          this.lessons[index].spaces -= 1
          this.cart.push(this.lessons[index]);
          console.log(this.lessons[index].subject, " has been added to cart!");
        }
      }

      console.log(this.lessons[index].spaces, " available lesson space(s) after adding to cart!");

    },
    /**
     * Function to remove lesson from cart
     * @param {string} id
     * */
    removeFromCart(id) {
      let index = this.cart.findIndex(lesson => lesson.id === id);
      let lessonIndex = this.lessons.findIndex(lesson => lesson.id === id);

      if (this.cart[index].bookedSpaces > 1) {
        console.log("cart booked spaces is > 1")
        this.lessons[lessonIndex].bookedSpaces -= 1;
        this.cart[index].bookedSpaces = this.lessons[lessonIndex].bookedSpaces;
        this.lessons[lessonIndex].spaces += 1;
        console.log(this.cart[index].bookedSpaces, " booked space(s) are left!");
      } else if (this.cart[index].bookedSpaces == 1) {
        this.lessons[lessonIndex].bookedSpaces -= 1;
        this.cart[index].bookedSpaces -= 1;
        this.lessons[lessonIndex].spaces += 1;
        this.cart.splice(index, 1);
        console.log(this.lessons[lessonIndex].subject + " at index " + index + " of cart has been removed from cart!");
      }
      console.log(this.lessons[lessonIndex].spaces, " available lesson space(s) after removed from cart!");
    },
    /**
     * Function to compare lesson prices
     * @param {object} a
     * @param {object} b
     * @returns {number}-1 if a.price < b.price and 1 if a.price > b.price and 0 if equal
     * */
    comparePrice(a, b) {
      if (a.price < b.price) {
        return -1
      } else if (a.price > b.price) {
        return 1
      }

      return 0
    },
    /**
     * Function to compare two strings
     * @param {string} string1
     * @param {string} string2
     * @returns {number}-1 if string1 < string2 and 1 if string1 > string2 and 0 if equal
     * */
    compareTwoStrings(string1, string2) {
      if (string1 === string2) {
        return 0;
      } else if (string1 < string2) {
        return -1;
      } else if (string1 > string2) {
        return 1;
      }
    },
    /**
     * Function to sort lessons
     * */
    sortLessons() {
      let sorted;

      if (this.sortOptions.ascendingByPrice === true) {
        console.log("Ascending by price: ", this.sortOptions.ascendingByPrice)
        sorted = this.lessons.toSorted((a, b) => a.price - b.price);
        this.lessons = sorted
      } else if (this.sortOptions.descendingByPrice === true) {
        console.log("Descending by price: ", this.sortOptions.descendingByPrice)
        sorted = this.lessons.toSorted((a, b) => b.price - a.price);
        this.lessons = sorted
      } else if (this.sortOptions.ascendingByLocation === true) {
        console.log("Ascending by location: ", this.sortOptions.ascendingByLocation)
        sorted = this.lessons.toSorted((a, b) => a.location.localeCompare(b.location));
        this.lessons = sorted
      } else if (this.sortOptions.descendingByLocation === true) {
        console.log("Descending by location: ", this.sortOptions.descendingByLocation)
        sorted = this.lessons.toSorted((a, b) => b.location.localeCompare(a.location));
        this.lessons = sorted
      } else if (this.sortOptions.ascendingBySubject === true) {
        console.log("Ascending by subject: ", this.sortOptions.ascendingBySubject)
        sorted = this.lessons.toSorted((a, b) => a.subject.localeCompare(b.subject));
        this.lessons = sorted
      } else if (this.sortOptions.descendingBySubject === true) {
        console.log("Descending by subject: ", this.sortOptions.descendingBySubject)
        sorted = this.lessons.toSorted((a, b) => b.subject.localeCompare(a.subject));
        this.lessons = sorted
      } else if (this.sortOptions.ascendingBySpaces === true) {
        console.log("Ascending by spaces: ", this.sortOptions.ascendingBySpaces)
        sorted = this.lessons.toSorted((a, b) => a.spaces - b.spaces);
        this.lessons = sorted
      } else if (this.sortOptions.descendingBySpaces === true) {
        console.log("Descending by spaces: ", this.sortOptions.descendingBySpaces)
        sorted = this.lessons.toSorted((a, b) => b.spaces - a.spaces);
        this.lessons = sorted
      }
    },
    /**
     * Function to update sorting options status
     * */
    updateAllSortingOptions() {
      Object.keys(this.sortOptions).forEach(key => {
        this.sortOptions[key] = false;
        console.log(this.sortOptions[key])
      });
    },
    /**
     * Function to add lesson to cart
     * @return {Promise}
     * */
    async searchToUrl() {
      this.page = 'search_page';
      this.showLessons = false;
      this.showSearchResults = true;

      let homeButton = document.getElementsByClassName("back_home_btn");
      homeButton[0].innerText = 'Home';

      let newUrl = `https://cst3144-coursework.onrender.com/search?q=${encodeURIComponent(this.searchString)}`;

      try {
        const response = await fetch((newUrl), {
          method: 'GET',
        });

        this.searchResults = await response.json();

        let searchResultJSON = await this.searchResults;
        console.log("Received search results: ", searchResultJSON);

      } catch (err) {
        console.error("Could not fetch search results from server ", err);
      }
    },
    /**
     * Function to find key of a value in an array of objects
     * @param {array} arr
     * @param {string} value
     * @return {string} key
     * */
    findKeyOfValue(arr, value) {

      let fields = [
        "location",
        "price",
        "subject",
        "spaces"
      ]

      let searchArr = arr

      for (const obj of searchArr) {
        console.log("The object subject: ", obj.subject)
        for (let key in obj) {
          if (fields.includes(key)) {
            if (obj[key].includes(value)) {
              return key;
            }
          }
        }
      }
      return "null"
    },
    /**
     * Function to get the value of an object key
     * @param {object} obj
     * @param {string} key
     * @return {string} value
     * */
    getKeyValue(obj, key) {
      return obj[key];
    },
    /**
     * Function to load image url
     * @param {string} imageName
     * @return {string} image url
     * */
    fetchLessonImages(imageName) {
      return `https://cst3144-coursework.onrender.com/images/${imageName}`
    },
    /**
     * Function to calculate total price of cart items
     * @return {number} totalPrice
     * */
    calculateTotalPrice() {
      let totalPrice = 0

      for (let lesson of this.cart) {
        if (lesson.bookedSpaces > 1) {
          totalPrice = totalPrice + (Number(lesson.price) * Number(lesson.bookedSpaces))
        } else {
          totalPrice = totalPrice + Number(lesson.price)
        }
      }

      return totalPrice;
    }
  },
  mounted() {
    this.getLessons();
  },
});