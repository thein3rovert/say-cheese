package store

import (
	"database/sql"
	"strings"

	_ "modernc.org/sqlite"
)

type SQLiteStore struct {
	db *sql.DB
}

func NewSQLiteStore(dsn string) (*SQLiteStore, error) {
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	s := &SQLiteStore{db: db}
	if err := s.migrate(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *SQLiteStore) DB() *sql.DB {
	return s.db
}

func (s *SQLiteStore) migrate() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS photos (
			id TEXT PRIMARY KEY,
			filename TEXT NOT NULL,
			path TEXT NOT NULL,
			caption TEXT,
			description TEXT,
			created_at DATETIME NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS tags (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE
		);`,
		`CREATE TABLE IF NOT EXISTS photo_tags (
			photo_id TEXT NOT NULL,
			tag_id INTEGER NOT NULL,
			PRIMARY KEY (photo_id, tag_id),
			FOREIGN KEY (photo_id) REFERENCES photos(id),
			FOREIGN KEY (tag_id) REFERENCES tags(id)
		);`,
	}
	for _, q := range queries {
		if _, err := s.db.Exec(q); err != nil {
			return err
		}
	}

	// Migrate: add EXIF columns if they don't exist
	alterQueries := []string{
		`ALTER TABLE photos ADD COLUMN camera TEXT;`,
		`ALTER TABLE photos ADD COLUMN lens TEXT;`,
		`ALTER TABLE photos ADD COLUMN aperture TEXT;`,
		`ALTER TABLE photos ADD COLUMN shutter_speed TEXT;`,
		`ALTER TABLE photos ADD COLUMN iso TEXT;`,
		`ALTER TABLE photos ADD COLUMN location TEXT;`,
		`ALTER TABLE photos ADD COLUMN date_taken TEXT;`,
	}
	for _, q := range alterQueries {
		if _, err := s.db.Exec(q); err != nil {
			// Ignore "duplicate column name" errors
			if !strings.Contains(err.Error(), "duplicate column name") {
				return err
			}
		}
	}

	return nil
}
