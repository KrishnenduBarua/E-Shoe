import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiHome } from "react-icons/fi";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | E-Shoe</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <FiHome />
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
