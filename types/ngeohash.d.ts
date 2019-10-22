declare module 'ngeohash' {
  interface Location {
    longitude: number;
    latitude: number;
  }

  type BoundingBox = [number, number, number, number];

  type Direction = [number, number];

  interface GeoHash {
    encode_int: (latitude: number, longitude: number, bitDepth?: number) => number;
    decode_int: (hashinteger: number, bitDepth?: number) => Location;
    decode_bbox_int: (hashinteger: number, bitDepth?: number) => BoundingBox;
    bboxes_int: (minlat: number, minlon: number, maxlat: number, maxlon: number, bitDepth?: number) => number[];
    neighbor_int: (hashinteger: number, direction: Direction, bitDepth?: number) => number;
    neighbors_int: (hashinteger: number, bitDepth?: number) => number[];
  }

  const geohash: GeoHash;

  export = geohash;
}
