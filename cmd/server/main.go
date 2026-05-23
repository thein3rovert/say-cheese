package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/thein3rovert/gallery/internal/handler"
	"github.com/thein3rovert/gallery/internal/middleware"
	"github.com/thein3rovert/gallery/internal/model"
	"github.com/thein3rovert/gallery/internal/service"
	"github.com/thein3rovert/gallery/internal/store"
)

func main() {
	// ── Data directory (Docker volume mount point) ──
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "./data"
	}
	photosDir := filepath.Join(dataDir, "photos")
	
	// Ensure directories exist
	if err := os.MkdirAll(photosDir, 0755); err != nil {
		log.Fatalf("Failed to create photos directory: %v", err)
	}

	// ── Data layer ──
	dbPath := filepath.Join(dataDir, "gallery.db")
	db, err := store.NewSQLiteStore(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialise store: %v", err)
	}

	photoStore := store.NewPhotoStore(db.DB())

	// Auto-scan photos directory on startup
	scanPhotos(photoStore, photosDir)

	// ── Service layer ──
	photoService := service.NewPhotoService(photoStore)

	// ── Handler layer ──
	photoHandler := handler.NewPhotoHandler(photoService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "7070"
	}

	mux := http.NewServeMux()

	// API routes (Go 1.22+ pattern syntax)
	mux.HandleFunc("GET /api/photos", photoHandler.ListPhotos)
	mux.HandleFunc("GET /api/photos/search", photoHandler.SearchPhotos)
	mux.HandleFunc("POST /api/photos/upload", photoHandler.UploadPhoto)
	mux.HandleFunc("GET /api/photos/{id}", photoHandler.GetPhoto)

	// Static file server for photos
	mux.Handle("/photos/", http.StripPrefix("/photos/", http.FileServer(http.Dir(photosDir))))

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	log.Printf("Gallery server starting on http://localhost:%s", port)
	log.Printf("Data directory: %s", dataDir)
	log.Printf("API: http://localhost:%s/api/photos", port)
	if err := http.ListenAndServe(":"+port, middleware.CORS(middleware.CustomLogger(mux))); err != nil {
		log.Fatal(err)
	}
}

// scanPhotos walks the photos directory and registers any unregistered files
func scanPhotos(ps *store.PhotoStore, photosDir string) {
	if _, err := os.Stat(photosDir); os.IsNotExist(err) {
		log.Println("photos directory does not exist, skipping scan")
		return
	}

	existing, err := ps.ListPhotos()
	if err != nil {
		log.Printf("Warning: could not list existing photos: %v", err)
		return
	}

	registered := make(map[string]bool)
	for _, p := range existing {
		registered[p.Path] = true
	}

	entries, err := os.ReadDir(photosDir)
	if err != nil {
		log.Printf("Warning: could not read photos dir: %v", err)
		return
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if entry.Name() == ".gitkeep" {
			continue
		}
		
		// Store relative path in DB for portability
		relPath := filepath.Join("photos", entry.Name())
		if registered[relPath] {
			continue
		}

		name := entry.Name()
		if idx := strings.Index(name, "_"); idx > 0 {
			name = name[idx+1:]
		}
		caption := strings.TrimSuffix(name, filepath.Ext(name))
		caption = strings.ReplaceAll(caption, "-", " ")
		caption = strings.ReplaceAll(caption, "_", " ")

		photo := &model.Photo{
			Filename: entry.Name(),
			Path:     relPath,
			Caption:  caption,
		}
		if err := ps.SavePhoto(photo); err != nil {
			log.Printf("Failed to register %s: %v", entry.Name(), err)
		} else {
			log.Printf("Registered photo: %s", entry.Name())
		}
	}
}
