import {
  Wand2,
  Tv2,
  Grid,
  CircuitBoard,
  Box,
  Gem,
  PenTool,
  Paintbrush2,
  Shapes,
  Eye,
} from "lucide-react";

// Images
import AutoCatImage from "public/auto_cat.png";
import AnimeCatImage from "public/anime_cat.png";
import PixelArtCatImage from "public/pixelart_cat.png";
import CyberpunkCatImage from "public/cyberpunk_cat.png";
import Model3dCatImage from "public/3d_cat.png";
import LowPolyCatImage from "public/lowpoly_cat.png";
import LineArtCatImage from "public/lineart_cat.png";
import WatercolorCatImage from "public/watercolor_cat.png";
import PopArtCatImage from "public/popart_cat.png";
import SurrealCatImage from "public/surreal_cat.png";

export const IMAGE_STYLES = [
  { name: "Auto", icon: Wand2, id: "auto", imageUrl: AutoCatImage },
  { name: "Anime", icon: Tv2, id: "anime", imageUrl: AnimeCatImage },
  {
    name: "Pixel Art",
    icon: Grid,
    id: "pixel-art",
    imageUrl: PixelArtCatImage,
  },
  {
    name: "Cyberpunk",
    icon: CircuitBoard,
    id: "cyberpunk",
    imageUrl: CyberpunkCatImage,
  },
  { name: "3D Model", icon: Box, id: "3d-model", imageUrl: Model3dCatImage },
  { name: "Low Poly", icon: Gem, id: "low-poly", imageUrl: LowPolyCatImage },
  {
    name: "Line Art",
    icon: PenTool,
    id: "line-art",
    imageUrl: LineArtCatImage,
  },
  {
    name: "Watercolor",
    icon: Paintbrush2,
    id: "watercolor",
    imageUrl: WatercolorCatImage,
  },
  { name: "Pop Art", icon: Shapes, id: "pop-art", imageUrl: PopArtCatImage },
  {
    name: "Surrealism",
    icon: Eye,
    id: "surrealism",
    imageUrl: SurrealCatImage,
  },
] as const;

export type Style = (typeof IMAGE_STYLES)[number]["id"];
