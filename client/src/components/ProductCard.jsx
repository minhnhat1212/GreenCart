import React from "react";
import { assets, unitsByCategory } from "../assets/assets";
import { useAppContext } from "../context/AppContext.jsx";

const ProductCard = ({ product }) => {
  const {
    addToCart,
    removeFromCart,
    cartItems,
    navigate,
    formatCurrency,
  } = useAppContext();

  const displayUnit =
    product.unit || unitsByCategory[product.category]?.[0] || "";

  if (!product) return null;

  const hasDiscount = product.price > product.offerPrice;

  return (
    <div
      onClick={() => {
        navigate(`/products/ ${product.category.toLowerCase()}/${product._id}`);
        scrollTo(0, 0);
      }}
      className="group bg-white border border-gray-100 rounded-2xl shadow-[0_15px_40px_rgba(16,185,129,0.08)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.16)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="relative w-full h-48 overflow-hidden">
        <img
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          src={product.image[0]}
          alt={product.name}
          loading="lazy"
        />
        {product.certificate && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-emerald-700 shadow-sm">
            <img src={assets.leaf_icon} alt="" className="w-3.5 h-3.5" />
            {product.certificate}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 py-5 text-gray-500/80 grow">
        <div>
          <p className="text-gray-900 text-lg font-semibold leading-snug">
            {product.name}
          </p>
          {Array.isArray(product.description) && product.description[0] && (
            <p className="text-sm text-gray-500 mt-1">
              {product.description[0]}
            </p>
          )}
          {product.origin && (
            <p className="text-xs text-gray-400 mt-1">
              Xuất xứ: {product.origin}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">
                {formatCurrency(product.price)}
              </p>
            )}
            <p className="text-2xl font-semibold text-emerald-600">
              {formatCurrency(product.offerPrice)}
            </p>
            {displayUnit && (
              <p className="text-xs text-gray-500">{`/${displayUnit}`}</p>
            )}
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="flex-shrink-0"
          >
            {!cartItems[product._id] ? (
              <button
                className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
                onClick={() => addToCart(product._id)}
              >
                <img
                  src={assets.cart_icon}
                  alt="cart_icon"
                  className="w-5 filter brightness-0 invert"
                />
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium select-none">
                <button
                  onClick={() => {
                    removeFromCart(product._id);
                  }}
                  className="text-lg leading-none"
                >
                  -
                </button>
                <span className="min-w-4 text-center">
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={() => {
                    addToCart(product._id);
                  }}
                  className="text-lg leading-none"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
