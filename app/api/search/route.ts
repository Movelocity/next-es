import { NextRequest, NextResponse } from 'next/server';
import { Client } from "@elastic/elasticsearch"

export const runtime = "nodejs";

const ES_NODE = process.env.ES_NODE ?? "http://localhost:9200";
const ES_USER = process.env.ES_USER ?? "elastic";
const ES_PASS = process.env.ES_PASS ?? "changeme";

const es = new Client({
  node: ES_NODE,
  auth: {
    username: ES_USER,
    password: ES_PASS
  }
});
export const POST = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const index = searchParams.get('index') ?? "";
  const searchDict = await req.json();

  try {
    const result = await es.search({
      index: index,
      ...searchDict
    });
    console.log("took: ", result.took)
    return NextResponse.json(result);

  } catch (err:any) {
    console.error(err);
    return NextResponse.json({ error: err.message });
  }
}

export const revalidate = 0;