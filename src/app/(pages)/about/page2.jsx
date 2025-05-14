"use client";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaUtensils } from "react-icons/fa";
import Image from "next/image";

const foodItems = [
  {
    id: 1,
    name: "Gourmet Burger",
    description: "Juicy beef patty with artisanal toppings",
    price: "$12.99",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 2,
    name: "Margherita Pizza",
    description: "Classic Italian pizza with fresh mozzarella",
    price: "$14.99",
    image:
      "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 3,
    name: "Sushi Platter",
    description: "Assorted fresh sushi rolls",
    price: "$22.99",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80",
  },
  {
    id: 4,
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with creamy dressing",
    price: "$9.99",
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
  },
];

const CarouselItem = ({ item, isActive }) => (
  <div
    className={`absolute w-full h-full transition-opacity duration-500 ${
      isActive ? "opacity-100" : "opacity-0"
    }`}
  >
    <Image
      src={item.image}
      alt={item.name}
      className="w-full h-full object-cover rounded-lg"
    />
    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6 rounded-lg">
      <h2 className="text-white text-2xl font-bold mb-2">{item.name}</h2>
      <p className="text-white mb-2">{item.description}</p>
      <p className="text-yellow-400 text-xl font-bold mb-4">{item.price}</p>
    </div>
  </div>
);

const RestaurantCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % foodItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + foodItems.length) % foodItems.length
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto h-96 overflow-hidden rounded-lg shadow-xl"
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      {foodItems.map((item, index) => (
        <CarouselItem
          key={item.id}
          item={item}
          isActive={index === currentIndex}
        />
      ))}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition duration-300 ease-in-out focus:outline-none"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="text-black text-2xl" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition duration-300 ease-in-out focus:outline-none"
        aria-label="Next slide"
      >
        <FaChevronRight className="text-black text-2xl" />
      </button>
      <div className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md">
        <FaUtensils className="text-yellow-500 text-2xl" />
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {foodItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default RestaurantCarousel;
