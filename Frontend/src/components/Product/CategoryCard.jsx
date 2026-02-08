import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/products/${category.slug}`}
      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={category.image || "https://via.placeholder.com/400"}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
        <div className="p-4 w-full">
          <h3 className="text-white text-xl font-bold text-center">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
