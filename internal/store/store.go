package store

import "github.com/thein3rovert/gallery/internal/model"

type Store interface {
	SavePhoto(photo *model.Photo) error
	ListPhotos() ([]model.Photo, error)
	SaveTag(name string) (int64, error)
	AddTagToPhoto(photoID, tagID int64) error
	ListTags() ([]model.Tag, error)
	GetPhotoTags(photoID int64) ([]model.Tag, error)
	SearchPhotos(query string) ([]model.Photo, error)
	GetPhotoByTag(tagName string) ([]model.Photo, error)
}
