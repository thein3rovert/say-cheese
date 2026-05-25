package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/thein3rovert/gallery/internal/model"
	"github.com/thein3rovert/gallery/internal/service"
)

// PhotoHandler wires HTTP to the photo service.
type PhotoHandler struct {
	svc *service.PhotoService
}

func NewPhotoHandler(svc *service.PhotoService) *PhotoHandler {
	return &PhotoHandler{svc: svc}
}

func (h *PhotoHandler) ListPhotos(w http.ResponseWriter, r *http.Request) {
	photos, err := h.svc.ListPhotos()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list photos")
		return
	}
	respondJSON(w, http.StatusOK, photos)
}

func (h *PhotoHandler) GetPhoto(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "photo ID is required")
		return
	}

	photo, err := h.svc.GetPhoto(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to get photo")
		return
	}
	if photo == nil {
		respondError(w, http.StatusNotFound, "photo not found")
		return
	}
	respondJSON(w, http.StatusOK, photo)
}

func (h *PhotoHandler) UpdatePhoto(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "photo ID is required")
		return
	}

	photo, err := h.svc.GetPhoto(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to get photo")
		return
	}
	if photo == nil {
		respondError(w, http.StatusNotFound, "photo not found")
		return
	}

	// Parse JSON body
	var update model.Photo
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	// Only update allowed fields
	photo.Caption = update.Caption
	photo.Description = update.Description
	photo.Camera = update.Camera
	photo.Lens = update.Lens
	photo.Aperture = update.Aperture
	photo.ShutterSpeed = update.ShutterSpeed
	photo.ISO = update.ISO
	photo.Location = update.Location
	photo.DateTaken = update.DateTaken

	if err := h.svc.UpdatePhoto(photo); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update photo")
		return
	}

	respondJSON(w, http.StatusOK, photo)
}

func (h *PhotoHandler) UploadPhoto(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		respondError(w, http.StatusBadRequest, "failed to parse form")
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil {
		respondError(w, http.StatusBadRequest, "photo file is required")
		return
	}
	defer file.Close()

	// Get data directory from env or default
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "./data"
	}
	photosDir := filepath.Join(dataDir, "photos")
	
	if err := os.MkdirAll(photosDir, 0755); err != nil {
		respondError(w, http.StatusInternalServerError, "could not create photos directory")
		return
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), header.Filename)
	savePath := filepath.Join(photosDir, filename)

	destination, err := os.Create(savePath)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "could not save file")
		return
	}
	defer destination.Close()

	if _, err := io.Copy(destination, file); err != nil {
		respondError(w, http.StatusInternalServerError, "could not write file")
		return
	}

	// Generate thumbnail
	thumbPath, err := service.GenerateThumbnail(savePath, photosDir)
	if err != nil {
		log.Printf("Failed to generate thumbnail: %v", err)
		thumbPath = "" // Continue without thumbnail
	}

	photo := &model.Photo{
		Filename:      header.Filename,
		Path:          filepath.Join("photos", filename),
		ThumbnailPath: thumbPath,
		Caption:       r.FormValue("caption"),
	}

	if err := h.svc.SavePhoto(photo); err != nil {
		respondError(w, http.StatusInternalServerError, "could not save photo metadata")
		return
	}

	tagsValue := r.FormValue("tags")
	if tagsValue != "" {
		h.svc.AddTags(photo.ID, strings.Fields(tagsValue))
	}

	respondJSON(w, http.StatusCreated, photo)
}

func (h *PhotoHandler) DeletePhoto(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "photo ID is required")
		return
	}

	photo, err := h.svc.GetPhoto(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to get photo")
		return
	}
	if photo == nil {
		respondError(w, http.StatusNotFound, "photo not found")
		return
	}

	// Delete file from disk
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "./data"
	}
	filePath := filepath.Join(dataDir, photo.Path)
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		log.Printf("Warning: could not delete file %s: %v", filePath, err)
	}

	// Delete from DB
	if err := h.svc.DeletePhoto(id); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete photo")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *PhotoHandler) SearchPhotos(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	var photos []model.Photo
	var err error

	if strings.HasPrefix(query, "tags:") {
		tagName := strings.TrimPrefix(query, "tags:")
		photos, err = h.svc.GetByTag(tagName)
	} else {
		photos, err = h.svc.Search(query)
	}

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to search photos")
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"photos":       photos,
		"search_query": query,
	})
}
