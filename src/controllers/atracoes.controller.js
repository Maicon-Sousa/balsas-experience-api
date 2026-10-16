import { prisma } from '../prisma.js';

// Traz a categoria e as tags junto com cada atração
const incluir = { categoria: true, tags: true };

// Converte o registro do banco para o formato que a API devolve
function formatar(atracao) {
  return {
    id: atracao.id,
    nome: atracao.nome,
    categoria: atracao.categoria.nome,
    descricao: atracao.descricao,
    localizacao: { cidade: atracao.cidade, estado: atracao.estado },
    distanciaCentroKm: atracao.distanciaCentroKm,
    tags: atracao.tags.map((tag) => tag.nome),
  };
}

// Transforma a lista de nomes em "conecte ou crie" a tag
function conectarTags(tags) {
  return tags.map((nome) => ({
    where: { nome },
    create: { nome },
  }));
}

// Ids inválidos (como "abc") viram 404, igual a um id que não existe
function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) ? id : null;
}

export async function listar(req, res) {
  const { categoria, tag } = req.query;

  const where = {};

  if (categoria) {
    where.categoria = { nome: { equals: categoria, mode: 'insensitive' } };
  }

  if (tag) {
    where.tags = { some: { nome: { equals: tag, mode: 'insensitive' } } };
  }

  const atracoes = await prisma.atracao.findMany({
    where,
    include: incluir,
    orderBy: { id: 'asc' },
  });

  res.json(atracoes.map(formatar));
}

export async function buscarPorId(req, res) {
  const id = lerId(req.params.id);

  const atracao =
    id === null
      ? null
      : await prisma.atracao.findUnique({ where: { id }, include: incluir });

  if (!atracao) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }

  res.json(formatar(atracao));
}

export async function criar(req, res) {
  const { nome, categoria, descricao, localizacao, distanciaCentroKm, tags } = req.body ?? {};

  if (!nome || !categoria || !descricao) {
    return res.status(400).json({
      erro: 'Os campos nome, categoria e descricao são obrigatórios',
    });
  }

  const nova = await prisma.atracao.create({
    data: {
      nome,
      descricao,
      cidade: localizacao?.cidade ?? 'Balsas',
      estado: localizacao?.estado ?? 'MA',
      distanciaCentroKm: distanciaCentroKm ?? null,
      categoria: {
        connectOrCreate: { where: { nome: categoria }, create: { nome: categoria } },
      },
      tags: { connectOrCreate: conectarTags(tags ?? []) },
    },
    include: incluir,
  });

  res.status(201).location(`/atracoes/${nova.id}`).json(formatar(nova));
}

export async function atualizar(req, res) {
  const id = lerId(req.params.id);

  const existente =
    id === null ? null : await prisma.atracao.findUnique({ where: { id } });

  if (!existente) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }

  const { nome, categoria, descricao, localizacao, distanciaCentroKm, tags } = req.body ?? {};

  if (!nome || !categoria || !descricao) {
    return res.status(400).json({
      erro: 'Os campos nome, categoria e descricao são obrigatórios',
    });
  }

  // Primeiro limpa as tags antigas, depois liga as novas
  await prisma.atracao.update({ where: { id }, data: { tags: { set: [] } } });

  const atualizada = await prisma.atracao.update({
    where: { id },
    data: {
      nome,
      descricao,
      cidade: localizacao?.cidade ?? 'Balsas',
      estado: localizacao?.estado ?? 'MA',
      distanciaCentroKm: distanciaCentroKm ?? null,
      categoria: {
        connectOrCreate: { where: { nome: categoria }, create: { nome: categoria } },
      },
      tags: { connectOrCreate: conectarTags(tags ?? []) },
    },
    include: incluir,
  });

  res.json(formatar(atualizada));
}

export async function remover(req, res) {
  const id = lerId(req.params.id);

  const existente =
    id === null ? null : await prisma.atracao.findUnique({ where: { id } });

  if (!existente) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }

  // As avaliações da atração são apagadas junto (onDelete: Cascade)
  await prisma.atracao.delete({ where: { id } });

  res.status(204).end();
}