import { NextRequest, NextResponse } from 'next/server'

const HOP_HEADERS = new Set(['host','connection','content-length','accept-encoding'])

function buildUrl(base: string, path: string, search: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base.replace(/\/$/, '')}${normalized}${search ? `?${search}` : ''}`
}

function corsify(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  return res
}

async function forwardWithFallbacks(req: NextRequest, pathSegments: string[]) {
  const base = process.env.RELAYER_BASE
  if (!base) {
    return NextResponse.json({ error: 'RELAYER_BASE not configured' }, { status: 500 })
  }

  const originalPath = '/' + pathSegments.join('/')
  const search = req.nextUrl.searchParams.toString()

  // Determine fallback list based on the first segment intent
  const head = pathSegments[0] || ''
  let candidates: string[] = [originalPath]
  if (head.includes('health') || head.includes('status')) {
    candidates = ['/health', '/status', '/v1/health']
  } else if (head.includes('publish') || head.includes('relay')) {
    candidates = ['/publish', '/relay', '/v1/publish']
  } else if (head.includes('reencrypt') || head.includes('peek')) {
    candidates = ['/reencrypt', '/peek', '/v1/reencrypt']
  } else if (head.includes('metrics')) {
    candidates = ['/metrics', '/v1/metrics']
  }

  const tried: { url: string; status?: number }[] = []

  // Prepare outgoing request init
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { if (!HOP_HEADERS.has(k.toLowerCase())) headers[k] = v })
  const body = req.method === 'GET' || req.method === 'OPTIONS' ? undefined : await req.text()

  for (let i = 0; i < candidates.length; i++) {
    const url = buildUrl(base, candidates[i], search)
    const res = await fetch(url, { method: req.method, headers, body, redirect: 'manual' })
    tried.push({ url, status: res.status })
    if (res.status === 404 && i < candidates.length - 1) {
      // Try next fallback
      continue
    }
    // Return immediately (success or non-404 error)
    const buf = await res.arrayBuffer()
    const nextRes = new NextResponse(buf, { status: res.status })
    res.headers.forEach((v, k) => nextRes.headers.set(k, v))
    if (process.env.NODE_ENV !== 'production') {
      console.info('[relayer-proxy]', req.method, res.status, url)
    }
    return corsify(nextRes)
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[relayer-proxy] all fallbacks failed', tried)
  }
  return corsify(NextResponse.json({ error: 'All relayer paths failed', tried }, { status: 502 }))
}

export async function OPTIONS() {
  return corsify(NextResponse.json({ ok: true }))
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardWithFallbacks(req, params.path || [])
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardWithFallbacks(req, params.path || [])
}


