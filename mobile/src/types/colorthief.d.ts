// Type declarations for colorthief library
declare module 'colorthief' {
  export default class ColorThief {
    /**
     * Get dominant color from an image
     * @param img Image element or canvas
     * @param quality Quality of the color extraction (1-10, default: 10)
     * @returns RGB array [r, g, b]
     */
    getColor(img: HTMLImageElement | HTMLCanvasElement, quality?: number): [number, number, number];

    /**
     * Get color palette from an image
     * @param img Image element or canvas
     * @param colorCount Number of colors to extract (default: 10)
     * @param quality Quality of the color extraction (1-10, default: 10)
     * @returns Array of RGB arrays [[r, g, b], [r, g, b], ...]
     */
    getPalette(
      img: HTMLImageElement | HTMLCanvasElement, 
      colorCount?: number, 
      quality?: number
    ): Array<[number, number, number]>;
  }
}