
import Navbar from "../components/Navbar/Navbar"
import Pricing from "../components/Pricing/Pricing"
import Testimonial from "../components/Testimonials/Testimonial"
import NewsletterSubscription from "../components/Newsletter/NewsletterSubscription"


const Home = () => {
  return (
    <div>
    <Navbar />
    <main>
      {/* <Hero /> */}
      {/* <Features /> */}
      {/* <HowItWorks /> */}
      <Pricing />
      <Testimonial />
      {/* <FaQ /> */}
      <NewsletterSubscription />
    </main>
    <footer>
      {/* <Footer /> */}
    </footer>
  </div>
  )
}

export default Home