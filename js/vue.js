const app = new Vue({
  el: "#app",
  data: {
    lessons: [],
    cart: [],
    showLessons: true,
  },
  methods: {
    goToCheckOut () {
      this.showLessons = !this.showLessons;
    },
    async getLessons() {
      try {
        const response = await fetch("http://localhost:8090/lessons", {
          method: 'GET',
        });
        let data = await response.json();
        console.log("Got lessons successfully: ", data);
        this.lessons = data
      } catch (err) {
        console.error(err);
      }
    },
    addToCart(index) {
      this.cart.push(this.lessons[index].id);

      console.log(this.lessons[index].id);
    },
  },
  mounted() {
    this.getLessons();
  }
});