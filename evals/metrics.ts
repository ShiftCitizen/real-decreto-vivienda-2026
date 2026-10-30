import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export type Contador = { ok: number; total: number };

export type InformeEvals = {
  RecallAt1: number;
  RecallAt4: number;
  ScopeGate: number;
  CitationValidity: number;
  Faithfulness: number | null;
  LatencyMs: number;
  Cost: number | null;
  corpusSize: number;
  single: Contador;
  multi: Contador;
  scope: Contador;
  citation: Contador;
};

export function ratio(c: Contador): number {
  return c.total === 0 ? 1 : c.ok / c.total;
}

export function escribirInforme(informe: InformeEvals, outDir: string): void {
  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, 'eval-report.json');
  const mdPath = join(outDir, 'eval-report.md');
  writeFileSync(jsonPath, JSON.stringify(informe, null, 2) + '\n');
  const md = [
    '# Eval report',
    '',
    `| Métrica | Valor |`,
    `| --- | --- |`,
    `| Corpus | ${informe.corpusSize} |`,
    `| Recall@1 | ${(informe.RecallAt1 * 100).toFixed(1)}% |`,
    `| Recall@4 | ${(informe.RecallAt4 * 100).toFixed(1)}% |`,
    `| Scope Gate | ${(informe.ScopeGate * 100).toFixed(1)}% |`,
    `| Citation Validity | ${(informe.CitationValidity * 100).toFixed(1)}% |`,
    `| Faithfulness | ${informe.Faithfulness == null ? 'n/a (on-demand)' : `${(informe.Faithfulness * 100).toFixed(1)}%`} |`,
    `| Latency | ${informe.LatencyMs} ms |`,
    `| Cost | ${informe.Cost == null ? 'n/a' : informe.Cost} |`,
    '',
  ].join('\n');
  writeFileSync(mdPath, md);
  console.log(`informe: ${jsonPath}`);
  console.log(`informe: ${mdPath}`);
  console.log(JSON.stringify(informe, null, 2));
}
