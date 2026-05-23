package api

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/thein3rovert/gallery/internal/model"
	"github.com/thein3rovert/gallery/internal/store"
)

type PhotoHandler struct {
	store store.Store
}

func NewPhotoHandler(s store.Store) *PhotoHandler {
	return &PhotoHandler{store: s}
}

func (h *PhotoHandler) ListPhotos(w http.ResponseWriter, r *http.Request) {
	photos, err := h.store.ListPhotos()
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to list photos")
		return
	}
	RespondJSON(w, http.StatusOK, photos)
}

func (h *PhotoHandler) GetPhoto(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		RespondError(w, http.StatusBadRequest, "photo ID is required")
		return
	}

	photos, err := h.store.ListPhotos()
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to get photo")
		return
	}

	for _, p := range photos {
		if fmt.Sprintf("%d", p.ID) == idStr {
			tags, _ := h.store.GetPhotoTags(p.ID)
			p.Tags = tags
			RespondJSON(w, http.StatusOK, p)
			return
		}
	}
	RespondError(w, http.StatusNotFound, "photo not found")
}

func (h *PhotoHandler) UploadPhoto(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		RespondError(w, http.StatusBadRequest, "failed to parse form")
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil {
		RespondError(w, http.StatusBadRequest, "photo file is required")
		return
	}
	defer file.Close()

	if err := os.MkdirAll("photos", 0755); err != nil {
		RespondError(w, http.StatusInternalServerError, "could not create photos directory")
		return
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), header.Filename)
	savePath := filepath.Join("photos", filename)

	destination, err := os.Create(savePath)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "could not save file")
		return
	}
	defer destination.Close()

	if _, err := io.Copy(destination, file); err != nil {
		RespondError(w, http.StatusInternalServerError, "could not write file")
		return
	}

	photo := &model.Photo{
		Filename: header.Filename,
		Path:     savePath,
		Caption:  r.FormValue("caption"),
	}

	if err := h.store.SavePhoto(photo); err != nil {
		RespondError(w, http.StatusInternalServerError, "could not save photo metadata")
		return
	}

	tagsValue := r.FormValue("tags")
	if tagsValue != "" {
		for _, tagName := range strings.Fields(tagsValue) {
			tagID, err := h.store.SaveTag(tagName)
			if err != nil {
				continue
			}
			h.store.AddTagToPhoto(photo.ID, tagID)
		}
	}

	RespondJSON(w, http.StatusCreated, photo)
}

func (h *PhotoHandler) SearchPhotos(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	var photos []model.Photo
	var err error

	if strings.HasPrefix(query, "tags:") {
		tagName := strings.TrimPrefix(query, "tags:")
		photos, err = h.store.GetPhotoByTag(tagName)
	} else if query == "" {
		photos, err = h.store.ListPhotos()
	} else {
		photos, err = h.store.SearchPhotos(query)
	}

	if err != nil {
		RespondError(w, http.StatusInternalServerError, "failed to search photos")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]interface{}{
		"photos":       photos,
		"search_query": query,
	})
}
