import type { AppEdge, AppNode } from "~/Types/nodes";
import { v4 as uuidv4 } from "uuid";
import { imageGenerationTemplate } from "./imageGeneration";

export type Template = {
  title: string;
  nodes: AppNode[];
  edges: AppEdge[];
};

type TemplateMap = Record<string, Template>;

const templates: TemplateMap = {
  "image-generation": imageGenerationTemplate,
} as const;

// This function will expose all templates, then switch out the node id's to new random one's and modify edges accordingly.
export function getTemplate(name: string): Template | undefined {
  const template = templates[name];

  if (!template) return undefined;

  // Create a mapping of old node IDs to new random IDs
  const idMapping: Record<string, string> = {};

  // Create a deep copy of the template and update node IDs
  const nodes = template.nodes.map((node) => {
    const newId = uuidv4();
    idMapping[node.id] = newId;
    return { ...node, id: newId };
  });

  // Update edge connections using the new node IDs
  const edges = template.edges.map((edge) => ({
    ...edge,
    id: uuidv4(),
    source: idMapping[edge.source]!,
    target: idMapping[edge.target]!,
  }));
  // Update the template title
  const title = template.title;

  return {
    title,
    nodes,
    edges,
  };
}
