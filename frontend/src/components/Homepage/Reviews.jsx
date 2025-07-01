import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaStar } from 'react-icons/fa';

const testimonials = [
  {
    name: "Priya Sharma",
    title: "Investment Advisor",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    quote:
      "Moneyantra has simplified tax calculations for all my clients. The accuracy and detailed reports have saved us countless hours during tax season.",
  },
  {
    name: "Riya Singh",
    title: "Investor",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    rating: 3,
    quote:
      "Moneyantra has simplified tax calculations for all me and my family members.",
  },
];

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-[#2b4b5a] text-white md:h-[400px] h-auto  text-center py-12 p-4">
      <div className="text-center mb-10 m-4">
        <h2 className="text-2xl md:text-3xl font-bold">Trusted by Investors and Advisor Professionals</h2>
        <p className="mt-2 text-blue-200">
          Join thousands of investors and advisor professionals who rely on Moneyantra for portfolio
          insights and tax calculations
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative bg-white text-black p-2 rounded-lg shadow-lg max-w-2xl w-full">
          <div className="mb-4 flex gap-1 text-yellow-500">
            {Array(testimonials[currentIndex].rating).fill().map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>
          <p className="mb-6 text-lg">"{testimonials[currentIndex].quote}"</p>
          <div className="flex items-center gap-4">
            <img
              className="w-12 h-12 rounded-full"
              src={testimonials[currentIndex].image}
              alt={testimonials[currentIndex].name}
            />
            <div>
              <p className="font-semibold">{testimonials[currentIndex].name}</p>
              <p className="text-sm text-gray-600">{testimonials[currentIndex].title}</p>
            </div>
          </div>

          <button
            onClick={handlePrev}
            className="absolute left-[-1.5rem] top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-2 shadow"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-[-1.5rem] top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-2 shadow"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>

      <div className="flex justify-center m-4 space-x-2">
        {testimonials.map((_, index) => (
          <span
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full cursor-pointer ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-400'
              }`}
          ></span>
        ))}
      </div>
    </div>
  );
}
