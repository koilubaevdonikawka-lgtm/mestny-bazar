/** Задача №153 — shared shape both map pickers report back to LocationPickerDialog. */
export interface PickedLocation {
  latitude: number;
  longitude: number;
  /** Reverse-geocoded text (Nominatim) — null if that lookup failed; the dialog keeps whatever address text was already there in that case. */
  address: string | null;
}

export interface MapPickerProps {
  /** Called every time the point settles (click, or drag release) — not on every intermediate drag frame. */
  onPick: (location: PickedLocation) => void;
}
