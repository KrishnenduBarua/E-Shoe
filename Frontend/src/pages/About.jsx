import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Flick</title>
      </Helmet>

      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-black text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
          <div className="container-custom text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Flick</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Your trusted partner for premium footwear since 2020
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="container-custom py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Flick was founded with a simple mission: to provide high-quality,
              stylish footwear at affordable prices. We believe everyone
              deserves to step out in confidence, and we're committed to making
              that possible.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With years of experience in the footwear industry, we've built
              relationships with trusted manufacturers worldwide to bring you
              the best shoes for every occasion.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-gray-50 py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✨
                </div>
                <h3 className="text-xl font-bold mb-2">Quality</h3>
                <p className="text-gray-600">
                  We never compromise on quality, ensuring every product meets
                  our high standards.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  💰
                </div>
                <h3 className="text-xl font-bold mb-2">Affordability</h3>
                <p className="text-gray-600">
                  Premium quality shouldn't break the bank. We offer competitive
                  prices for everyone.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🤝
                </div>
                <h3 className="text-xl font-bold mb-2">Trust</h3>
                <p className="text-gray-600">
                  Building lasting relationships with our customers through
                  transparency and integrity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="container-custom py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Shop?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our collection and find the perfect shoes for your style.
          </p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    </>
  );
};

export default About;
