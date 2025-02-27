import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService, Movie, Genre } from '../../services/movie.service';

@Component({
  selector: 'app-movie-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-create.component.html',
  styleUrl : './movie-create.component.css'
})
export class MovieCreateComponent implements OnInit {
  movie: Movie = {
    id: 0,
    title: '',
    year: new Date().getFullYear(),
    director: '',
    genre: [],
    plot: '',
    cast: []
  };
  
  genres: Genre[] = [];
  selectedGenre: string = '';
  error: string | null = null;
  errors: { [key: string]: string } = {};

  constructor(
    private router: Router,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.loadGenres();
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
    if (this.selectedGenre) {
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
    if (this.movie.genre) {
      this.movie.genre.splice(index, 1);
    }
  }

  validateMovie(): boolean {
    this.errors = {};
    let isValid = true;
    
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
    
    this.movieService.createMovie(this.movie).subscribe(
      (created) => {
        this.router.navigate(['/movies', created.id]);
      },
      (error) => {
        this.error = 'Failed to create movie';
        console.error('Error creating movie:', error);
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/movies']);
  }
}