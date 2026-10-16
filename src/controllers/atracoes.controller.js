import atracoes from '../data/atracoes.json' with { type: 'json' };

// O maior id já usado, mais um. Assim o id não se repete depois de uma remoção
function proximoId() {
  return atracoes.reduce((maior, atracao) => Math.max(maior, atracao.id), 0) + 1;
}

export function listar(req, res) {
  const { categoria, tag } = req.query;

  let resultado = atracoes;

  if (categoria) {
    resultado = resultado.filter(
      (atracao) => atracao.categoria.toLowerCase() === categoria.toLowerCase()
    );
  }

  if (tag) {
    resultado = resultado.filter((atracao) =>
      atracao.tags.some((cadaTag) => cadaTag.toLowerCase() === tag.toLowerCase())
    );
  }

  res.json(resultado);
}

export function buscarPorId(req, res) {
  const atracao = atracoes.find((item) => item.id === Number(req.params.id));

  if (!atracao) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }

  res.json(atracao);
}

export function criar(req, res) {
  const { nome, categoria, descricao, localizacao, distanciaCentroKm, tags } = req.body ?? {};

  if (!nome || !categoria || !descricao) {
    return res.status(400).json({
      erro: 'Os campos nome, categoria e descricao são obrigatórios',
    });
  }

  const nova = {
    id: proximoId(),
    nome,
    categoria,
    descricao,
    localizacao: localizacao ?? { cidade: 'Balsas', estado: 'MA' },
    distanciaCentroKm: distanciaCentroKm ?? null,
    tags: tags ?? [],
  };

  atracoes.push(nova);
  res.status(201).location(`/atracoes/${nova.id}`).json(nova);
}

export function atualizar(req, res) {
  const id = Number(req.params.id);
  const indice = atracoes.findIndex((item) => item.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }

  const { nome, categoria, descricao, localizacao, distanciaCentroKm, tags } = req.body ?? {};

  if (!nome || !categoria || !descricao) {
    return res.status(400).json({
      erro: 'Os campos nome, categoria e descricao são obrigatórios',
    });
  }

  atracoes[indice] = {
    id,
    nome,
    categoria,
    descricao,
    localizacao: localizacao ?? { cidade: 'Balsas', estado: 'MA' },
    distanciaCentroKm: distanciaCentroKm ?? null,
    tags: tags ?? [],
  };

  res.json(atracoes[indice]);
}

export function remover(req, res) {
  const indice = atracoes.findIndex((item) => item.id === Number(req.params.id));

  if (indice === -1) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }

  atracoes.splice(indice, 1);
  res.status(204).end();
}