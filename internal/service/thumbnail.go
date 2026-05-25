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

	// Generate thumbnail filename: photo.jpg -> thumb_photo.jpg
	filename := filepath.Base(photoPath)
	thumbFilename := "thumb_" + filename
	thumbPath := filepath.Join(photosDir, thumbFilename)

	// Check if thumbnail already exists
	if _, err := os.Stat(thumbPath); err == nil {
		return filepath.Join("photos", thumbFilename), nil
	}

	// Resize to 800px width, height auto-calculated (keeps aspect ratio)
	thumb := imaging.Resize(src, 800, 0, imaging.Lanczos)

	// Save thumbnail as JPEG with 85% quality
	if err := imaging.Save(thumb, thumbPath, imaging.JPEGQuality(85)); err != nil {
		return "", err
	}

	return filepath.Join("photos", thumbFilename), nil
}
