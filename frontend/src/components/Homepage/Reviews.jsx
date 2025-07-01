import React, { useState, useEffect } from 'react'; // Import useEffect
// Removed: import { FaArrowLeft, FaArrowRight, FaStar } from 'react-icons/fa';

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
  // Added two new testimonials below
  {
    name: "Amit Kumar",
    title: "Financial Analyst",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    quote:
      "The precision of Moneyantra's tax calculations is unmatched. It's an indispensable tool for anyone serious about optimizing their investment portfolio.",
  },
  {
    name: "Sneha Reddy",
    title: "Entrepreneur",
    image: "https://randomuser.me/api/portraits/women/67.jpg",
    rating: 4,
    quote:
      "As a busy entrepreneur, I need quick and reliable tax solutions. Moneyantra delivers exactly that, making tax season a breeze.",
  },
];

// Inline SVG for Left Arrow
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

// Inline SVG for Right Arrow
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

// Inline SVG for Star
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.929 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
    </svg>
);


export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect to handle automatic sliding
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000); // Change testimonial every 5 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-[#2b4b5a] text-white md:h-[400px] h-auto text-center py-12 p-4">
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
              <StarIcon key={i} /> // Using inline SVG StarIcon
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
            <ArrowLeftIcon /> {/* Using inline SVG ArrowLeftIcon */}
          </button>
          <button
            onClick={handleNext}
            className="absolute right-[-1.5rem] top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-2 shadow"
          >
            <ArrowRightIcon /> {/* Using inline SVG ArrowRightIcon */}
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
