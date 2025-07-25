import type { Template } from "./templates";

export const imageGenerationTemplate: Template = {
  title: "Image Generation",
  nodes: [
    {
      data: {
        isLocked: false,
        text: "Gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
      },
      height: 217,
      id: "825b62c1-cff0-4abd-aedd-55654ba1c34d",
      position: { x: -87.5, y: -29 },
      type: "textEditor",
      width: 366,
      zIndex: 1,
    },
    {
      data: {
        imageUrl: null,
        isLocked: false,
        style: "auto",
      },
      id: "5f24bba6-f520-4c74-98ef-50b56fd9e138",
      position: { x: -289.4664601405549, y: 271.3229291637264 },
      type: "image",
      zIndex: 7,
    },
    {
      data: {
        isLocked: true,
        text: 'Press on the icon next to "Image" to change styles',
      },
      height: 125,
      id: "2cdfbfa8-cf0d-49ca-bf05-01aacf54ce1a",
      position: { x: -407.43248398109205, y: 77.67898235644876 },
      type: "comment",
      width: 237,
      zIndex: 6,
    },
    {
      data: {
        imageUrl: null,
        isLocked: false,
        style: "line-art",
      },
      id: "dc374c03-853e-46cc-b9fc-421386169b5b",
      position: { x: 108.86917244505753, y: 285.0371909975407 },
      type: "image",
      zIndex: 5,
    },
    {
      id: "b3a2a82e-f03a-4f73-9166-eb52ee9c8356",
      type: "instruction",
      position: { x: -301.28896298293864, y: 728.1116709201801 },
      data: {
        isLocked: false,
        text: "Modify the image to have a summer landscape",
      },
      zIndex: 8,
    },
  ],
  edges: [
    {
      id: "0fb01747-e7f3-4b93-8ddd-1bba5a8f0f8e",
      source: "825b62c1-cff0-4abd-aedd-55654ba1c34d",
      target: "5f24bba6-f520-4c74-98ef-50b56fd9e138",
      type: "default",
    },
    {
      id: "7bdf27c1-4acc-4510-8c43-20731c151d56",
      source: "825b62c1-cff0-4abd-aedd-55654ba1c34d",
      target: "dc374c03-853e-46cc-b9fc-421386169b5b",
      type: "default",
    },
    {
      source: "5f24bba6-f520-4c74-98ef-50b56fd9e138",
      target: "b3a2a82e-f03a-4f73-9166-eb52ee9c8356",
      id: "2f0a501f-ca80-4ee5-b5cf-43607570691d",
      type: "default",
    },
  ],
};
