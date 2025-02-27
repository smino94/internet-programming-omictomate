import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService, Movie } from '../../services/movie.service';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: `./movie-details.component.html`,
  styleUrl: `./movie-details.component.css`
})
export class MovieDetailsComponent implements OnInit {
  movie: Movie | null = null;
  error: string | null = null;
  
  get sortedCast() {
    return this.movie?.cast?.sort((a, b) => a.actor.localeCompare(b.actor)) || [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
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
        this.movie = movie;
      },
      (error) => {
        this.error = 'Failed to load movie details';
        console.error('Error loading movie:', error);
      }
    );
  }

  confirmDelete(): void {
    if (this.movie && confirm(`Are you sure you want to delete "${this.movie.title}"?`)) {
      this.movieService.deleteMovie(this.movie.id).subscribe(
        () => {
          this.router.navigate(['/movies']);
        },
        (error) => {
          console.error('Error deleting movie:', error);
        }
      );
    }
  }
}