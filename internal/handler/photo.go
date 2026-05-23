package handler

import (
	"fmt"
	"io"
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
	idStr := r.PathValue("id")
	if idStr == "" {
		respondError(w, http.StatusBadRequest, "photo ID is required")
		return
	}

	var id int64
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		respondError(w, http.StatusBadRequest, "invalid photo ID")
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

	photo := &model.Photo{
		Filename: header.Filename,
		Path:     filepath.Join("photos", filename),
		Caption:  r.FormValue("caption"),
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
