package store

import (
	"database/sql"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/thein3rovert/gallery/internal/model"
)

type PhotoStore struct {
	db *sql.DB
}

func NewPhotoStore(db *sql.DB) *PhotoStore {
	return &PhotoStore{db: db}
}

func (s *PhotoStore) SavePhoto(p *model.Photo) error {
	if p.ID == "" {
		p.ID = uuid.NewString()
	}
	p.CreatedAt = time.Now()
	_, err := s.db.Exec(
		`INSERT INTO photos (id, filename, path, caption, description, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
		p.ID, p.Filename, p.Path, p.Caption, p.Description, p.CreatedAt,
	)
	if err != nil {
		log.Printf("SavePhoto error: %v", err)
		return err
	}
	log.Printf("SavePhoto: id=%s filename=%s", p.ID, p.Filename)
	return nil
}

func (s *PhotoStore) ListPhotos() ([]model.Photo, error) {
	rows, err := s.db.Query(`SELECT id, filename, path, caption, description, created_at FROM photos ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var photos []model.Photo
	for rows.Next() {
		var p model.Photo
		if err := rows.Scan(&p.ID, &p.Filename, &p.Path, &p.Caption, &p.Description, &p.CreatedAt); err != nil {
			return nil, err
		}
		photos = append(photos, p)
	}
	return photos, rows.Err()
}

func (s *PhotoStore) SaveTag(name string) (int64, error) {
	_, err := s.db.Exec(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, name)
	if err != nil {
		return 0, err
	}
	var id int64
	err = s.db.QueryRow(`SELECT id FROM tags WHERE name = ?`, name).Scan(&id)
	return id, err
}

func (s *PhotoStore) AddTagToPhoto(photoID string, tagID int64) error {
	_, err := s.db.Exec(`INSERT OR IGNORE INTO photo_tags (photo_id, tag_id) VALUES (?, ?)`, photoID, tagID)
	return err
}

func (s *PhotoStore) ListTags() ([]model.Tag, error) {
	rows, err := s.db.Query(`SELECT id, name FROM tags ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []model.Tag
	for rows.Next() {
		var t model.Tag
		if err := rows.Scan(&t.ID, &t.Name); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, rows.Err()
}

func (s *PhotoStore) GetPhotoTags(photoID string) ([]model.Tag, error) {
	rows, err := s.db.Query(`SELECT t.id, t.name FROM tags t JOIN photo_tags pt ON pt.tag_id = t.id WHERE pt.photo_id = ?`, photoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []model.Tag
	for rows.Next() {
		var t model.Tag
		if err := rows.Scan(&t.ID, &t.Name); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, rows.Err()
}

func (s *PhotoStore) DeletePhoto(id string) error {
	_, err := s.db.Exec(`DELETE FROM photo_tags WHERE photo_id = ?`, id)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(`DELETE FROM photos WHERE id = ?`, id)
	return err
}

func (s *PhotoStore) SearchPhotos(query string) ([]model.Photo, error) {
	rows, err := s.db.Query(`SELECT id, filename, path, caption, description, created_at FROM photos WHERE caption LIKE ? OR filename LIKE ? ORDER BY created_at DESC`, "%"+query+"%", "%"+query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var photos []model.Photo
	for rows.Next() {
		var p model.Photo
		if err := rows.Scan(&p.ID, &p.Filename, &p.Path, &p.Caption, &p.Description, &p.CreatedAt); err != nil {
			return nil, err
		}
		photoTags, err := s.GetPhotoTags(p.ID)
		if err != nil {
			return nil, err
		}
		p.Tags = photoTags
		photos = append(photos, p)
	}
	return photos, rows.Err()
}

func (s *PhotoStore) GetPhotoByTag(tagName string) ([]model.Photo, error) {
	rows, err := s.db.Query(`SELECT p.id, p.filename, p.path, p.caption, p.description, p.created_at FROM photos p JOIN photo_tags pt ON pt.photo_id = p.id JOIN tags t ON t.id = pt.tag_id WHERE t.name = ? ORDER BY p.created_at DESC`, tagName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var photos []model.Photo
	for rows.Next() {
		var p model.Photo
		if err := rows.Scan(&p.ID, &p.Filename, &p.Path, &p.Caption, &p.Description, &p.CreatedAt); err != nil {
			return nil, err
		}
		photoTags, err := s.GetPhotoTags(p.ID)
		if err != nil {
			return nil, err
		}
		p.Tags = photoTags
		photos = append(photos, p)
	}
	return photos, rows.Err()
}
