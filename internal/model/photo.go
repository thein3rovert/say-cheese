package model

import "time"

type Photo struct {
	ID          int64     `json:"id"`
	Filename    string    `json:"filename"`
	Path        string    `json:"path"`
	Caption     string    `json:"caption"`
	Description string    `json:"description"`
	Tags        []Tag     `json:"tags"`
	CreatedAt   time.Time `json:"created_at"`
}
