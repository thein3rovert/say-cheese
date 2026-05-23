package model

import "time"

type Photo struct {
	ID          string    `json:"id"`
	Filename    string    `json:"filename"`
	Path        string    `json:"path"`
	Caption     string    `json:"caption"`
	Description string    `json:"description"`
	Tags        []Tag     `json:"tags"`
	CreatedAt   time.Time `json:"created_at"`
}
