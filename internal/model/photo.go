package model

import "time"

type Photo struct {
	ID            string    `json:"id"`
	Filename      string    `json:"filename"`
	Path          string    `json:"path"`
	ThumbnailPath string    `json:"thumbnail_path"`
	Caption       string    `json:"caption"`
	Description   string    `json:"description"`
	Camera        string    `json:"camera"`
	Lens          string    `json:"lens"`
	Aperture      string    `json:"aperture"`
	ShutterSpeed  string    `json:"shutter_speed"`
	ISO           string    `json:"iso"`
	Location      string    `json:"location"`
	DateTaken     string    `json:"date_taken"`
	Tags          []Tag     `json:"tags"`
	CreatedAt     time.Time `json:"created_at"`
}
