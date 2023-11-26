/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { fetchTrendingVideos, fetchTrendingTvShows } from '../Services/GlobalApi'; // Replace with your actual API functions
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Slider({ isTvSeries }) {
  const screenWidth = window.innerWidth;
  const [media, setMedia] = useState([]);
  const elementRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = isTvSeries ? await fetchTrendingTvShows() : await fetchTrendingVideos();
        console.log(response.data.results)
        setMedia(response.data.results);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [isTvSeries]);

  const sliderRight = (element) => {
    element.scrollLeft += screenWidth - 110;
  };

  const sliderLeft = (element) => {
    element.scrollLeft -= screenWidth - 110;
  };

  return (
    <div>
      <FaChevronLeft
        className="hidden md:block text-less-blue text-[30px] absolute mx-8 mt-[150px] cursor-pointer"
        onClick={() => sliderLeft(elementRef.current)}
      />
      <FaChevronRight
        className="hidden md:block text-less-blue text-[30px] absolute mx-8 mt-[150px] cursor-pointer right-0"
        onClick={() => sliderRight(elementRef.current)}
      />
      <h1 className="p-2 px-8 md:px-16 text-xl font-bold">
        {isTvSeries ? 'Trending TV Series' : 'Trending Movies'}
      </h1>
      <div
        className="flex overflow-x-auto w-full px-16 py-4 scrollbar-none scroll-smooth"
        ref={elementRef}
      >
        {media.map((item, index) => (
          <img
            src={import.meta.env.VITE_MOVIE_BASE_IMG + item.poster_path}
            key={index}
            alt={isTvSeries ? 'TV Show' : 'Movie'}
            className="md:min-w-[600px] h-[300px] mr-5 rounded-md object-center hover:border-[4px] border-less-blue transition-all duration-100 ease-in"
          />
        ))}
      </div>
    </div>
  );
}