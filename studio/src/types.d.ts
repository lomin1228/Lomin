declare module "*.geojson" {
  const value: {
    features: { geometry: { type: string; coordinates: unknown } }[];
  };
  export default value;
}
