export interface ArticleSigningFields {
  chainId: number;
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
  premium: boolean;
}

export function articleSigningMessage(fields: ArticleSigningFields): string {
  return `Nectar article publication\n${JSON.stringify({
    chainId: fields.chainId,
    title: fields.title,
    subtitle: fields.subtitle,
    content: fields.content,
    tags: fields.tags,
    premium: fields.premium,
  })}`;
}
