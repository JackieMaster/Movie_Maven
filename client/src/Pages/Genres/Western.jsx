/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import GenreMovieList from '../../Constant/GenreMovieList';
import MovieList from '../../Components/MovieList';
import { getMovieByGenreId } from '../../Services/GlobalApi';

export default function Adventure() {
  const westernGenre = GenreMovieList.genre.find((item) => item.name === 'Western');
  const [, setMovieList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMovies = async () => {
    try {
      const response = await getMovieByGenreId(westernGenre.id, currentPage);
      console.log(response.data.results);
      setMovieList((prevMovies) => [...prevMovies, ...response.data.results]);
      setCurrentPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
    }

  };
  useEffect(() => {
    fetchMovies();
  }, []);
  return (
    <div>
      {westernGenre && (
        <div key={westernGenre.id} className="p-8 px-8 md:px-16">
          <h1 className="text-[20px] font-bold">{westernGenre.name} Movies</h1>
          <MovieList genreId={westernGenre.id} />
        </div>
      )}
    </div>
  );
}