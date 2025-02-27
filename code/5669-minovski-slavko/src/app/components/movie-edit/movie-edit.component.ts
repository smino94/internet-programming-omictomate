import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService, Movie, Genre } from '../../services/movie.service';

@Component({
  selector: 'app-movie-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: `./movie-edit.component.html`,
  styleUrl: `./movie-edit.component.css`
})
export class MovieEditComponent implements OnInit {
  movie: Movie | null = null;
  originalMovie: Movie | null = null;
  genres: Genre[] = [];
  selectedGenre: string = '';
  error: string | null = null;
  errors: { [key: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadMovie(id);
      } else {
        this.error = 'Invalid movie ID';
      }
    });
  }

  loadMovie(id: number): void {
    this.movieService.getMovie(id).subscribe(
      (movie) => {
        this.movie = { ...movie };
        this.originalMovie = { ...movie }; // Keep a copy of the original for comparison
      },
      (error) => {
        this.error = 'Failed to load movie';
        console.error('Error loading movie:', error);
      }
    );
  }

  loadGenres(): void {
    this.movieService.getGenres().subscribe(
      (genres) => {
        this.genres = genres;
      },
      (error) => {
        console.error('Error loading genres:', error);
      }
    );
  }

  addGenre(): void {
    if (this.selectedGenre && this.movie) {
      if (!this.movie.genre) {
        this.movie.genre = [];
      }
      
      // Only add if not already in the list
      if (!this.movie.genre.includes(this.selectedGenre)) {
        this.movie.genre.push(this.selectedGenre);
      }
      
      this.selectedGenre = '';
    }
  }

  removeGenre(index: number): void {
    if (this.movie && this.movie.genre) {
      this.movie.genre.splice(index, 1);
    }
  }

  validateMovie(): boolean {
    this.errors = {};
    let isValid = true;
    
    if (!this.movie) return false;
    
    if (!this.movie.title?.trim()) {
      this.errors['title'] = 'Title is required';
      isValid = false;
    }
    
    if (!this.movie.year) {
      this.errors['year'] = 'Year is required';
      isValid = false;
    }
    
    if (!this.movie.director?.trim()) {
      this.errors['director'] = 'Director is required';
      isValid = false;
    }
    
    if (!this.movie.genre || this.movie.genre.length === 0) {
      this.errors['genre'] = 'At least one genre is required';
      isValid = false;
    }
    
    return isValid;
  }

  saveMovie(): void {
    if (!this.validateMovie()) {
      return;
    }
    
    if (this.movie) {
      this.movieService.updateMovie(this.movie).subscribe(
        (updated) => {
          this.router.navigate(['/movies', updated.id]);
        },
        (error) => {
          this.error = 'Failed to update movie';
          console.error('Error updating movie:', error);
        }
      );
    }
  }

  cancel(): void {
    if (this.movie && this.originalMovie) {
      this.router.navigate(['/movies', this.movie.id]);
    } else {
      this.router.navigate(['/movies']);
    }
  }
}