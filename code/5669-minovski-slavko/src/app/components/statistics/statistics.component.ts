import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService, Movie, Actor } from '../../services/movie.service';

interface DecadeStats {
  decade: string;
  count: number;
}

interface GenreStats {
  genre: string;
  count: number;
}

interface OscarStats {
  type: string;
  count: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./statistics.component.html`,
  styleUrl: `./statistics.component.css`
})
export class StatisticsComponent implements OnInit {
  totalMovies: number = 0;
  totalActors: number = 0;
  totalGenres: number = 0;
  totalOscars: number = 0;
  decadeStats: DecadeStats[] = [];
  genreStats: GenreStats[] = [];
  oscarStats: OscarStats[] = [];
  actorsWithoutDetails: number = 0;
  
  loading: boolean = true;
  error: string | null = null;
  
  private movies: Movie[] = [];
  private actors: Actor[] = [];
  private movieActors: Set<string> = new Set();

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    
    // Fetch movies
    this.movieService.getMovies().subscribe(
      (movies) => {
        this.movies = movies;
        this.totalMovies = movies.length;
        this.calculateMovieStatistics();
        
        // After movies are loaded, fetch actors
        this.movieService.getActors().subscribe(
          (actors) => {
            this.actors = actors;
            this.totalActors = actors.length;
            this.calculateActorStatistics();
            this.loading = false;
          },
          (error) => {
            this.handleError('Failed to load actors');
          }
        );
      },
      (error) => {
        this.handleError('Failed to load movies');
      }
    );
    
    // Fetch genres
    this.movieService.getGenres().subscribe(
      (genres) => {
        this.totalGenres = genres.length;
      },
      (error) => {
        console.error('Error loading genres:', error);
      }
    );
  }

  calculateMovieStatistics(): void {
    // Count oscars
    let oscarCounts: { [key: string]: number } = {};
    
    // Collect all actors from movies
    this.movies.forEach(movie => {
      // Count oscars
      if (movie.oscars) {
        this.totalOscars += Object.keys(movie.oscars).length;
        
        Object.keys(movie.oscars).forEach(oscarType => {
          oscarCounts[oscarType] = (oscarCounts[oscarType] || 0) + 1;
        });
      }
      
      // Collect movie actors
      if (movie.cast) {
        movie.cast.forEach(castMember => {
          this.movieActors.add(castMember.actor);
        });
      }
    });
    
    // Convert oscar counts to array
    this.oscarStats = Object.keys(oscarCounts).map(type => ({
      type,
      count: oscarCounts[type]
    })).sort((a, b) => b.count - a.count);
    
    // Calculate decade statistics
    this.calculateDecadeStats();
    
    // Calculate genre statistics
    this.calculateGenreStats();
  }

  calculateDecadeStats(): void {
    const decadeCounts: { [key: string]: number } = {};
    
    this.movies.forEach(movie => {
      if (movie.year) {
        const decade = Math.floor(movie.year / 10) * 10;
        const decadeStr = `${decade}s`;
        decadeCounts[decadeStr] = (decadeCounts[decadeStr] || 0) + 1;
      }
    });
    
    this.decadeStats = Object.keys(decadeCounts).map(decade => ({
      decade,
      count: decadeCounts[decade]
    })).sort((a, b) => {
      // Extract the numeric part of the decade string and compare
      const decadeA = parseInt(a.decade);
      const decadeB = parseInt(b.decade);
      return decadeA - decadeB;
    });
  }

  calculateGenreStats(): void {
    const genreCounts: { [key: string]: number } = {};
    
    this.movies.forEach(movie => {
      if (movie.genre && movie.genre.length > 0) {
        movie.genre.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
    
    this.genreStats = Object.keys(genreCounts).map(genre => ({
      genre,
      count: genreCounts[genre]
    })).sort((a, b) => b.count - a.count);
  }

  calculateActorStatistics(): void {
    // Count actors without details
    const actorNames = new Set(this.actors.map(actor => actor.name));
    
    this.actorsWithoutDetails = 0;
    this.movieActors.forEach(actorName => {
      if (!actorNames.has(actorName)) {
        this.actorsWithoutDetails++;
      }
    });
  }

  formatOscarType(type: string): string {
    // Convert camelCase to Title Case with spaces
    return type
      .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
      .replace(/^./, str => str.toUpperCase()) // Uppercase the first letter
      .trim();
  }

  handleError(message: string): void {
    this.error = message;
    this.loading = false;
    console.error(message);
  }
}