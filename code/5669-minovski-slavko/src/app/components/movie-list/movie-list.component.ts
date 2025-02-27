import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService, Movie } from '../../services/movie.service';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: `./movie-list.component.html`,
  styleUrl: `./movie-list.component.css`
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];

  constructor(private movieService: MovieService, private router: Router) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getMovies().subscribe(
      (movies) => {
        this.movies = movies;
      },
      (error) => {
        console.error('Error loading movies:', error);
      }
    );
  }

  formatGenres(genres: string[]): string {
    return genres?.join(' / ') || 'N/A';
  }

  countOscars(oscars: { [key: string]: string } | undefined): string {
    if (!oscars) return '0';
    return Object.keys(oscars).length.toString();
  }

  confirmDelete(movie: Movie): void {
    if (confirm(`Are you sure you want to delete "${movie.title}"?`)) {
      this.deleteMovie(movie.id);
    }
  }

  deleteMovie(id: number): void {
    this.movieService.deleteMovie(id).subscribe(
      () => {
        this.movies = this.movies.filter(movie => movie.id !== id);
      },
      (error) => {
        console.error('Error deleting movie:', error);
      }
    );
  }
}