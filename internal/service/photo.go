package service

import (
	"github.com/thein3rovert/gallery/internal/model"
	"github.com/thein3rovert/gallery/internal/store"
)

// PhotoService sits between handlers and the store — business logic lives here.
type PhotoService struct {
	store store.Store
}

func NewPhotoService(s store.Store) *PhotoService {
	return &PhotoService{store: s}
}

func (svc *PhotoService) ListPhotos() ([]model.Photo, error) {
	return svc.store.ListPhotos()
}

func (svc *PhotoService) GetPhoto(id string) (*model.Photo, error) {
	photos, err := svc.store.ListPhotos()
	if err != nil {
		return nil, err
	}
	for _, p := range photos {
		if p.ID == id {
			tags, _ := svc.store.GetPhotoTags(p.ID)
			p.Tags = tags
			return &p, nil
		}
	}
	return nil, nil
}

func (svc *PhotoService) SavePhoto(p *model.Photo) error {
	return svc.store.SavePhoto(p)
}

func (svc *PhotoService) AddTags(photoID string, tagNames []string) error {
	for _, name := range tagNames {
		tagID, err := svc.store.SaveTag(name)
		if err != nil {
			continue
		}
		if err := svc.store.AddTagToPhoto(photoID, tagID); err != nil {
			continue
		}
	}
	return nil
}

func (svc *PhotoService) Search(query string) ([]model.Photo, error) {
	if query == "" {
		return svc.store.ListPhotos()
	}
	return svc.store.SearchPhotos(query)
}

func (svc *PhotoService) GetByTag(tagName string) ([]model.Photo, error) {
	return svc.store.GetPhotoByTag(tagName)
}

func (svc *PhotoService) DeletePhoto(id string) error {
	return svc.store.DeletePhoto(id)
}
