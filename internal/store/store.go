package store

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/thein3rovert/gallery/internal/model"
)

const dataFile = "gallery.json"

// Store is the minimal interface the API needs
type Store interface {
	SavePhoto(photo *model.Photo) error
	ListPhotos() ([]model.Photo, error)
	SaveTag(name string) (int64, error)
	AddTagToPhoto(photoID, tagID int64) error
	GetPhotoTags(photoID int64) ([]model.Tag, error)
	SearchPhotos(query string) ([]model.Photo, error)
	GetPhotoByTag(tagName string) ([]model.Photo, error)
}

type jsonData struct {
	Photos []model.Photo `json:"photos"`
	Tags   []model.Tag   `json:"tags"`
	NextID int64         `json:"next_id"`
}

type JSONStore struct {
	mu   sync.RWMutex
	data jsonData
}

func NewJSONStore() *JSONStore {
	s := &JSONStore{data: jsonData{NextID: 1}}
	if _, err := os.Stat(dataFile); err == nil {
		b, err := os.ReadFile(dataFile)
		if err == nil {
			json.Unmarshal(b, &s.data)
		}
	}
	return s
}

func (s *JSONStore) save() error {
	b, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(dataFile, b, 0644)
}

func (s *JSONStore) SavePhoto(p *model.Photo) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	p.ID = s.data.NextID
	p.CreatedAt = time.Now()
	s.data.NextID++
	s.data.Photos = append([]model.Photo{*p}, s.data.Photos...)
	return s.save()
}

func (s *JSONStore) ListPhotos() ([]model.Photo, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]model.Photo, len(s.data.Photos))
	copy(out, s.data.Photos)
	for i := range out {
		out[i].Tags = s.tagsForPhoto(out[i].ID)
	}
	return out, nil
}

func (s *JSONStore) SaveTag(name string) (int64, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, t := range s.data.Tags {
		if t.Name == name {
			return t.ID, nil
		}
	}
	tag := model.Tag{ID: s.data.NextID, Name: name}
	s.data.NextID++
	s.data.Tags = append(s.data.Tags, tag)
	if err := s.save(); err != nil {
		return 0, err
	}
	return tag.ID, nil
}

func (s *JSONStore) AddTagToPhoto(photoID, tagID int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.data.Photos {
		if s.data.Photos[i].ID == photoID {
			for _, t := range s.data.Photos[i].Tags {
				if t.ID == tagID {
					return nil
				}
			}
			s.data.Photos[i].Tags = append(s.data.Photos[i].Tags, s.findTag(tagID))
			return s.save()
		}
	}
	return nil
}

func (s *JSONStore) ListTags() ([]model.Tag, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]model.Tag, len(s.data.Tags))
	copy(out, s.data.Tags)
	return out, nil
}

func (s *JSONStore) GetPhotoTags(photoID int64) ([]model.Tag, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.tagsForPhoto(photoID), nil
}

func (s *JSONStore) SearchPhotos(query string) ([]model.Photo, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	q := strings.ToLower(query)
	var out []model.Photo
	for _, p := range s.data.Photos {
		if strings.Contains(strings.ToLower(p.Filename), q) ||
			strings.Contains(strings.ToLower(p.Caption), q) ||
			strings.Contains(strings.ToLower(p.Description), q) {
			p.Tags = s.tagsForPhoto(p.ID)
			out = append(out, p)
		}
	}
	return out, nil
}

func (s *JSONStore) GetPhotoByTag(tagName string) ([]model.Photo, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var out []model.Photo
	for _, p := range s.data.Photos {
		for _, t := range p.Tags {
			if t.Name == tagName {
				out = append(out, p)
				break
			}
		}
	}
	return out, nil
}

func (s *JSONStore) tagsForPhoto(photoID int64) []model.Tag {
	for _, p := range s.data.Photos {
		if p.ID == photoID {
			out := make([]model.Tag, len(p.Tags))
			copy(out, p.Tags)
			return out
		}
	}
	return nil
}

func (s *JSONStore) findTag(id int64) model.Tag {
	for _, t := range s.data.Tags {
		if t.ID == id {
			return t
		}
	}
	return model.Tag{}
}

// ScanDirectory reads photos/ and registers any new files
func (s *JSONStore) ScanDirectory(dir string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	registered := make(map[string]bool)
	for _, p := range s.data.Photos {
		registered[p.Path] = true
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		path := filepath.Join(dir, entry.Name())
		if registered[path] {
			continue
		}
		name := entry.Name()
		if idx := strings.Index(name, "_"); idx > 0 {
			name = name[idx+1:]
		}
		caption := strings.TrimSuffix(name, filepath.Ext(name))
		caption = strings.ReplaceAll(caption, "-", " ")
		caption = strings.ReplaceAll(caption, "_", " ")

		p := model.Photo{
			ID:        s.data.NextID,
			Filename:  entry.Name(),
			Path:      path,
			Caption:   caption,
			CreatedAt: time.Now(),
		}
		s.data.NextID++
		s.data.Photos = append([]model.Photo{p}, s.data.Photos...)
	}
	return s.save()
}
