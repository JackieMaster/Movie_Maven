/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { getMovieByTvShow } from '../Services/GlobalApi';
import React, { useEffect, useRef, useState } from 'react';
import MovieCard from './MovieCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function TvshowList({ genresId }) {
  const [tvshowList, setTvshowList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const elementRef = useRef(null);
  const screenWidth = window.innerWidth;

  const getTvShows = async (page) => {
    try {
      const response = await getMovieByTvShow(genresId, page);
      console.log(response.data.results);
      setTvshowList((prevTvShows) => [...prevTvShows, ...response.data.results]);
    } catch (error) {
      console.error('Error fetching TV shows by genre:', error);
    }
  };

  const sliderRight = () => {
    elementRef.current.scrollLeft += screenWidth - 110;
  };

  const sliderLeft = () => {
    elementRef.current.scrollLeft -= screenWidth - 110;
  };

  const loadNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    getTvShows(currentPage + 1);
  };

  useEffect(() => {
    getTvShows(currentPage);
  }, [genresId, currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      const element = elementRef.current;
      if (element.scrollLeft + element.clientWidth >= element.scrollWidth) {
        // Fetch more TV shows when scrolled to the end
        loadNextPage();
      }
    };

    elementRef.current.addEventListener('scroll', handleScroll);

    return () => {
      // Cleanup event listener when component unmounts
      if (elementRef.current) {
        elementRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [genresId, currentPage]);

  return (
    <div>
      <FaChevronLeft
        className="hidden md:block text-less-blue text-[30px] absolute mx-8 mt-[150px] cursor-pointer left-0"
        onClick={() => sliderLeft()}
      />
      <FaChevronRight
        className="hidden md:block text-less-blue text-[30px] absolute mx-8 mt-[150px] cursor-pointer right-0"
        onClick={() => sliderRight()}
      />
      <div ref={elementRef} className='flex overflow-x-auto gap-8 scrollbar-none scroll-smooth py-5 px-3'>
        {tvshowList.map((item, index) => (
          item.poster_path && (
            <MovieCard key={index} movie={item} />
          )
        ))}
      </div>
    </div>
  );
}
