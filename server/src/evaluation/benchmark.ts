import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { retrievePdf } from "../retrieval";
import { benchmarkCases } from "./dataset";

// Documents the current retrieval baseline. This file does not configure retrieval.
const SIMILARITY_TOP_K = 3;
const BENCHMARK_NAME = "ITEC3710 Week 3";

type RetrievedHit = {
  rank: number;
  page: number | null;
  score: number | null;
};

type CaseResult = {
  id: number;
  question: string;
  answerable: boolean;
  expectedPage: number | null;
  retrieved: RetrievedHit[];
  expectedPageRank: number | null;
  top1Hit: boolean | null;
  hitAt3: boolean | null;
  reciprocalRank: number | null;
};

function toPage(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function toScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function formatScore(score: number | null): string {
  if (score === null) {
    return "n/a";
  }

  return score.toFixed(4);
}

function formatOptional(value: number | null, digits: number): string {
  if (value === null) {
    return "n/a";
  }

  return value.toFixed(digits);
}

function formatReciprocalRank(value: number | null): string {
  if (value === null) {
    return "n/a";
  }

  if (value === 0) {
    return "0";
  }

  if (value === 1) {
    return "1";
  }

  if (value === 0.5) {
    return "0.5";
  }

  return value.toFixed(3);
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function topScore(result: CaseResult): number | null {
  return result.retrieved[0]?.score ?? null;
}

function printCase(result: CaseResult): void {
  console.log(`Q${result.id}: ${result.question}`);

  if (result.answerable) {
    console.log(`Expected page: ${result.expectedPage}`);
  } else {
    console.log("Expected page: none (unanswerable)");
  }

  console.log("");

  if (result.retrieved.length === 0) {
    console.log("No results retrieved");
  } else {
    for (const hit of result.retrieved) {
      console.log(
        `Rank ${hit.rank} | Page ${hit.page ?? "n/a"} | Score ${formatScore(hit.score)}`,
      );
    }
  }

  console.log("");
  console.log(
    `Expected page rank: ${
      result.answerable ? (result.expectedPageRank ?? "not retrieved") : "n/a"
    }`,
  );
  console.log(`Top-1 Hit: ${result.answerable ? result.top1Hit : "n/a"}`);
  console.log(`Hit@3: ${result.answerable ? result.hitAt3 : "n/a"}`);
  console.log(
    `Reciprocal Rank: ${
      result.answerable ? formatReciprocalRank(result.reciprocalRank) : "n/a"
    }`,
  );
  console.log("--------------------------------------------------");
}

function chromaBaseUrl(): string {
  const configured = process.env.CHROMA_URL || "http://localhost:8000";
  return configured.replace(/^["']|["']$/g, "").replace(/\/$/, "");
}

async function findLectureDocumentId(): Promise<string> {
  const base = `${chromaBaseUrl()}/api/v2/tenants/default_tenant/databases/default_database`;
  const collectionsResponse = await fetch(`${base}/collections`);

  if (!collectionsResponse.ok) {
    throw new Error(
      "Chroma is not reachable. Start it with npm run chroma from the server folder, then run this file again.",
    );
  }

  const collectionsPayload: unknown = await collectionsResponse.json();
  const collections = Array.isArray(collectionsPayload)
    ? collectionsPayload
    : [collectionsPayload];
  const collection = collections.find(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      item.name === "pdf-knowledge",
  );

  if (
    !collection ||
    typeof collection !== "object" ||
    !("id" in collection) ||
    typeof collection.id !== "string"
  ) {
    throw new Error("Chroma collection pdf-knowledge was not found.");
  }

  const countResponse = await fetch(`${base}/collections/${collection.id}/count`);
  const count = await countResponse.json();
  const limit = typeof count === "number" ? count : 1000;
  const storedResponse = await fetch(`${base}/collections/${collection.id}/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      limit,
      include: ["metadatas"],
    }),
  });
  const stored = (await storedResponse.json()) as {
    metadatas?: Array<Record<string, unknown> | null>;
  };

  let documentId: string | null = null;

  for (const metadata of stored.metadatas ?? []) {
    if (
      metadata &&
      metadata.total_pages === 29 &&
      typeof metadata.documentId === "string" &&
      metadata.documentId.length > 0
    ) {
      documentId = metadata.documentId;
    }
  }

  if (!documentId) {
    throw new Error(
      "No 29-page lecture was found in Chroma. Upload the Week 3 PDF first, or pass a documentId.",
    );
  }

  return documentId;
}

async function main(): Promise<void> {
  const suppliedDocumentId = process.argv[2]?.trim();
  const documentId = suppliedDocumentId || (await findLectureDocumentId());

  console.log(`Document ID: ${documentId}`);
  console.log("");

  const cases: CaseResult[] = [];

  for (const testCase of benchmarkCases) {
    const nodes = await retrievePdf(testCase.question, documentId);
    const retrieved: RetrievedHit[] = nodes.map((node, index) => ({
      rank: index + 1,
      page: toPage(node.page),
      score: toScore(node.score),
    }));

    let expectedPageRank: number | null = null;
    let top1Hit: boolean | null = null;
    let hitAt3: boolean | null = null;
    let reciprocalRank: number | null = null;

    if (testCase.answerable && testCase.expectedPage !== null) {
      const match = retrieved.find((hit) => hit.page === testCase.expectedPage);
      expectedPageRank = match?.rank ?? null;

      const rankInTopK =
        expectedPageRank !== null && expectedPageRank <= SIMILARITY_TOP_K
          ? expectedPageRank
          : null;

      top1Hit = rankInTopK === 1;
      hitAt3 = rankInTopK !== null;
      reciprocalRank = rankInTopK === null ? 0 : 1 / rankInTopK;
    }

    const result: CaseResult = {
      id: testCase.id,
      question: testCase.question,
      answerable: testCase.answerable,
      expectedPage: testCase.expectedPage,
      retrieved,
      expectedPageRank,
      top1Hit,
      hitAt3,
      reciprocalRank,
    };

    cases.push(result);
    printCase(result);
  }

  const answerable = cases.filter((item) => item.answerable);
  const unanswerable = cases.filter((item) => !item.answerable);

  if (answerable.length !== 12 || unanswerable.length !== 5) {
    throw new Error(
      "Benchmark dataset must contain 12 answerable and 5 unanswerable questions.",
    );
  }

  const top1Hits = answerable.filter((item) => item.top1Hit === true).length;
  const hitsAt3 = answerable.filter((item) => item.hitAt3 === true).length;
  const mrr =
    answerable.reduce((sum, item) => sum + (item.reciprocalRank ?? 0), 0) /
    answerable.length;

  const top1Accuracy = (top1Hits / answerable.length) * 100;
  const recallAt3 = (hitsAt3 / answerable.length) * 100;

  const answerableTopScores = answerable
    .map(topScore)
    .filter((score): score is number => score !== null);
  const unanswerableTopScores = unanswerable
    .map(topScore)
    .filter((score): score is number => score !== null);

  const metrics = {
    top1Accuracy,
    recallAt3,
    mrr,
    answerableAverageTopScore: average(answerableTopScores),
    answerableMinimumTopScore:
      answerableTopScores.length === 0 ? null : Math.min(...answerableTopScores),
    unanswerableAverageTopScore: average(unanswerableTopScores),
    unanswerableMaximumTopScore:
      unanswerableTopScores.length === 0
        ? null
        : Math.max(...unanswerableTopScores),
  };

  console.log("");
  console.log("========== RETRIEVAL BENCHMARK SUMMARY ==========");
  console.log("");
  console.log(`Answerable questions: ${answerable.length}`);
  console.log(`Unanswerable questions: ${unanswerable.length}`);
  console.log("");
  console.log(`Top-1 Accuracy: ${top1Accuracy.toFixed(2)}%`);
  console.log(`Recall@3: ${recallAt3.toFixed(2)}%`);
  console.log(`MRR: ${mrr.toFixed(3)}`);
  console.log("");
  console.log(
    `Answerable avg top-1 score: ${formatOptional(metrics.answerableAverageTopScore, 4)}`,
  );
  console.log(
    `Answerable minimum top-1 score: ${formatOptional(metrics.answerableMinimumTopScore, 4)}`,
  );
  console.log("");
  console.log(
    `Unanswerable avg top-1 score: ${formatOptional(metrics.unanswerableAverageTopScore, 4)}`,
  );
  console.log(
    `Unanswerable maximum top-1 score: ${formatOptional(metrics.unanswerableMaximumTopScore, 4)}`,
  );
  console.log("");
  console.log("=================================================");

  const serverRoot = path.resolve(__dirname, "../..");
  const resultsDir = path.join(serverRoot, "evaluation-results");
  await mkdir(resultsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = path.join(resultsDir, `benchmark-${timestamp}.json`);
  const payload = {
    config: {
      similarityTopK: SIMILARITY_TOP_K,
      benchmarkName: BENCHMARK_NAME,
      documentId,
    },
    cases,
    metrics,
  };

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log("");
  console.log(`Results saved to ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
