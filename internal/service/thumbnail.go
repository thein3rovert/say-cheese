package service

import (
	"os"
	"path/filepath"

	"github.com/disintegration/imaging"
)

// GenerateThumbnail creates a thumbnail with max width 800px (height auto-calculated)
func GenerateThumbnail(photoPath string, photosDir string) (string, error) {
	// Open the original image
	src, err := imaging.Open(photoPath)
	if err != nil {
		return "", err
	}

	// Create thumbs subdirectory if it doesn't exist
	thumbsDir := filepath.Join(photosDir, "thumbs")
	if err := os.MkdirAll(thumbsDir, 0755); err != nil {
		return "", err
	}

	// Generate thumbnail filename: photo.jpg -> thumbs/photo.jpg
	filename := filepath.Base(photoPath)
	thumbPath := filepath.Join(thumbsDir, filename)

	// Check if thumbnail already exists
	if _, err := os.Stat(thumbPath); err == nil {
		return filepath.Join("photos", "thumbs", filename), nil
	}

	// Resize to 800px width, height auto-calculated (keeps aspect ratio)
	thumb := imaging.Resize(src, 800, 0, imaging.Lanczos)

	// Save thumbnail as JPEG with 85% quality
	if err := imaging.Save(thumb, thumbPath, imaging.JPEGQuality(85)); err != nil {
		return "", err
	}

	return filepath.Join("photos", "thumbs", filename), nil
}
