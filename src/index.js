// src/index.js — Worker utama untuk Drizz
// Uruskan permintaan API (/api/projects, /api/login) dan hantar baki
// permintaan ke fail statik dalam folder public/ (melalui binding ASSETS)

const jsonHeaders = { 'Content-Type': 'application/json' };

function checkAuth(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Basic ')) return false;
  let decoded;
  try {
    decoded = atob(auth.slice(6));
  } catch (e) {
    return false;
  }
  const sep = decoded.indexOf(':');
  const email = decoded.slice(0, sep);
  const password = decoded.slice(sep + 1);
  return email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD;
}

async function handleGetProjects(env) {
  const data = await env.PROJECTS_KV.get('projects');
  const projects = data ? JSON.parse(data) : [];
  return new Response(JSON.stringify(projects), { headers: jsonHeaders });
}

async function handlePostProject(request, env) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Tidak sah' }), { status: 401, headers: jsonHeaders });
  }
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Data tidak sah' }), { status: 400, headers: jsonHeaders });
  }
  if (!body.image || !body.link || !body.title) {
    return new Response(JSON.stringify({ error: 'Gambar, pautan dan tajuk diperlukan' }), { status: 400, headers: jsonHeaders });
  }
  const data = await env.PROJECTS_KV.get('projects');
  const projects = data ? JSON.parse(data) : [];
  const newProject = {
    id: crypto.randomUUID(),
    image: body.image,
    link: body.link,
    title: body.title,
    tag: body.tag || '',
    desc: body.desc || '',
    badge: body.badge || 'Lihat Projek'
  };
  projects.push(newProject);
  await env.PROJECTS_KV.put('projects', JSON.stringify(projects));
  return new Response(JSON.stringify(newProject), { headers: jsonHeaders });
}

async function handleDeleteProject(request, env) {
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Tidak sah' }), { status: 401, headers: jsonHeaders });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const data = await env.PROJECTS_KV.get('projects');
  let projects = data ? JSON.parse(data) : [];
  projects = projects.filter(p => p.id !== id);
  await env.PROJECTS_KV.put('projects', JSON.stringify(projects));
  return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
}

async function handleLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: jsonHeaders });
  }
  const { email, password } = body;
  if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
  }
  return new Response(JSON.stringify({ ok: false }), { status: 401, headers: jsonHeaders });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/projects') {
      if (request.method === 'GET') return handleGetProjects(env);
      if (request.method === 'POST') return handlePostProject(request, env);
      if (request.method === 'DELETE') return handleDeleteProject(request, env);
    }

    if (url.pathname === '/api/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    // Semua permintaan lain -> sajikan fail statik dari folder public/
    return env.ASSETS.fetch(request);
  }
};
