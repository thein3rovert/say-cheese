package main

import (
	"log"
	"net/http"
	"os"

	"github.com/thein3rovert/gallery/internal/handler"
	"github.com/thein3rovert/gallery/internal/middleware"
	"github.com/thein3rovert/gallery/internal/service"
	"github.com/thein3rovert/gallery/internal/store"
)

func main() {
	// ── Data layer ──
	photoStore := store.NewJSONStore()

	// Auto-scan photos directory on startup
	if err := photoStore.ScanDirectory("photos"); err != nil {
		log.Printf("Warning: could not scan photos: %v", err)
	}

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
	mux.Handle("/photos/", http.StripPrefix("/photos/", http.FileServer(http.Dir("./photos"))))

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	log.Printf("Gallery server starting on http://localhost:%s", port)
	log.Printf("API: http://localhost:%s/api/photos", port)
	if err := http.ListenAndServe(":"+port, middleware.CORS(middleware.CustomLogger(mux))); err != nil {
		log.Fatal(err)
	}
}
