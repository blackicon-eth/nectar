import { createBee } from "./client";

export interface GranteeListResult {
  reference: string;
  historyReference: string;
}

export interface CreateGranteeListOptions {
  beeUrl: string;
  postageBatchId: string;
  grantees: string[];
}

export async function createGranteeList(
  options: CreateGranteeListOptions,
): Promise<GranteeListResult> {
  const bee = createBee(options.beeUrl);
  const result = await bee.createGrantees(options.postageBatchId, options.grantees);
  return { reference: result.ref, historyReference: result.historyref };
}

export interface GetGranteeListOptions {
  beeUrl: string;
  reference: string;
}

export async function getGranteeList(
  options: GetGranteeListOptions,
): Promise<string[]> {
  const bee = createBee(options.beeUrl);
  const result = await bee.getGrantees(options.reference);
  return result.data;
}

export interface PatchGranteeListOptions {
  beeUrl: string;
  postageBatchId: string;
  reference: string;
  historyReference: string;
  add?: string[];
  revoke?: string[];
}

export async function patchGranteeList(
  options: PatchGranteeListOptions,
): Promise<GranteeListResult> {
  const bee = createBee(options.beeUrl);
  const result = await bee.patchGrantees(
    options.postageBatchId,
    options.reference,
    options.historyReference,
    { add: options.add, revoke: options.revoke },
  );
  return { reference: result.ref, historyReference: result.historyref };
}
