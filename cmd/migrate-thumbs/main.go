package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	"github.com/thein3rovert/gallery/internal/service"
	_ "modernc.org/sqlite"
)

func main() {
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "./data"
	}

	dbPath := filepath.Join(dataDir, "gallery.db")
	photosDir := filepath.Join(dataDir, "photos")

	db, err := sql.Open("sqlite", dbPath+"?_txlock=immediate")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Set pragmas for better concurrency
	db.Exec("PRAGMA busy_timeout = 10000")
	db.Exec("PRAGMA journal_mode = WAL")

	// Get all photos without thumbnails
	rows, err := db.Query(`SELECT id, path FROM photos WHERE thumbnail_path IS NULL OR thumbnail_path = ''`)
	if err != nil {
		log.Fatalf("Failed to query photos: %v", err)
	}
	defer rows.Close()

	type photoUpdate struct {
		id   string
		path string
	}
	var updates []photoUpdate
	for rows.Next() {
		var pu photoUpdate
		if err := rows.Scan(&pu.id, &pu.path); err != nil {
			log.Printf("Scan error: %v", err)
			continue
		}
		updates = append(updates, pu)
	}
	rows.Close()

	count := 0
	for _, pu := range updates {
		fullPath := filepath.Join(dataDir, pu.path)
		thumbPath, err := service.GenerateThumbnail(fullPath, photosDir)
		if err != nil {
			log.Printf("Failed to generate thumbnail for %s: %v", pu.path, err)
			continue
		}

		// Update database
		_, err = db.Exec(`UPDATE photos SET thumbnail_path = ? WHERE id = ?`, thumbPath, pu.id)
		if err != nil {
			log.Printf("Failed to update thumbnail_path for %s: %v", pu.id, err)
			continue
		}

		count++
		log.Printf("Generated thumbnail for %s", pu.path)
	}

	log.Printf("✅ Generated %d thumbnails", count)
}
