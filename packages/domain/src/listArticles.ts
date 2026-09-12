import { getConfig } from "@nectar/config";
import { listArticles } from "@nectar/arkiv";

export interface ArticleSummary {
  key: string;
  title: string;
  creator: string;
  premium: boolean;
  swarmRef: string;
}

export async function listPublishedArticles(): Promise<ArticleSummary[]> {
  const config = getConfig();
  const entities = await listArticles({ rpcUrl: config.arkiv.rpcUrl });

  return entities.map((entity) => {
    const readString = (name: string): string => {
      const attr = entity.attributes[name];
      return typeof attr?.value === "string" ? (attr.value as string) : "";
    };

    return {
      key: entity.key,
      title: readString("title"),
      creator: readString("creator"),
      premium: entity.attributes["premium"]?.value === true,
      swarmRef: readString("swarm_ref"),
    };
  });
}
