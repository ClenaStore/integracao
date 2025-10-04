// Mapa das finalizadoras (ID -> descrição) enviado por você:
export const FORMS_MAP = {
  "2":"CARTAO CREDITO TEF","3":"CARTAO DEBITO TEF","5":"CONSUMO FUNCIONARIOS",
  "12":"PGTO ONLINE DEBITO","9":"BONIFICACAO","34":"MARKETING","28":"BOLETO DELICIA INDUS",
  "29":"VOUCHER","10":"BOLETO","30":"PGT ONLINE DELIVERY","14":"PGTO ONLINE DINHEIRO",
  "13":"PGTO ONLINE PIX","11":"PGTO ONLINE CREDITO","4":"PIX CNPJ","32":"PAGAMENTO ONLINE",
  "33":"VOUCHER POS","1":"DINHEIRO","35":"VALE MERCATTO","36":"PREJUIZO","16":"PIX TEF",
  "31":"PGT ONLINE IFOOD","20":"BOLETO FAMILY PRODUT","17":"CREDITO POS","18":"DEBITO POS",
  "6":"REFEICAO ALIME. TEF","19":"CART ALIMENTACAO POS","7":"TOTEM CREDITO","15":"PIX QRCODE POS",
  "8":"TOTEM DEBITO","22":"BOLETO DELICIA PRODU","24":"BOLETO ALL TIME CHOP",
  "21":"BOLETO FOODS TIME","23":"BOLETO MEOS GOURMET","25":"BOLETO MERCATTO KIDS",
  "26":"CREDIARIO CLIENTES","27":"CONSUMO SOCIO"
};

// Agrupamento por categoria (palavras-chave em minúsculas):
export const CATEGORY_KEYWORDS = {
  "crédito": ["credito","cartao credito","totem credito","credito pos","pgto online credito","credito delivery","cart credito","crédito à vista"],
  "débito": ["debito","pgto online debito","cartao debito","totem debito","debito pos","debito delivery","cart debito"],
  "pix": ["pix","pgto online pix","qrcode","pix tef","pix cnpj","pix offline","pix itau","pix pos","pix qrcode pos"],
  "online": ["pagamento online","pagamentos online","refeicao","cart alimentacao","pgt online delivery","pgt online ifood"],
  "consumo interno": ["funcionario","convenio empresa","consumo funcionarios","consumo musicos","vale mercatto","prejuizo"],
  "boleto": ["boleto","delicia indus","delicia produ","foods time","meos gourmet","mercatto kids","family produt","all time chop"],
  "crediário": ["crediario","crediario clientes"],
  "voucher": ["voucher","cartao voucher","voucher pos","voucher delicia","voucher villa"],
  "dinheiro": ["dinheiro","pgto online dinheiro"],
  "bonificação": ["bonificacao"],
  "catálogo delivery": ["catalogo delivery","catálogo delivery"],
  "consumo sócio": ["socio","consumo sócio","consumo socio"],
  "marketing": ["marketing"],
  "transferência bancária": ["transferencia bancar","transferencia bancaria"],
  "erros garçom": ["erros garcons","erro garcom","erros garçom"],
  "sem faturamento": ["sem faturamento"],
  "outros": []
};

const norm = (s) =>
  s.toLowerCase()
   .normalize('NFD')
   .replace(/\p{Diacritic}/gu,'')
   .replace(/[^a-z0-9 ]/g,' ')
   .replace(/\s+/g,' ')
   .trim();

/** Resolve a categoria a partir do texto (descrição da finalizadora) */
export function toCategory(desc="") {
  const n = norm(desc);
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => n.includes(norm(k)))) return cat;
  }
  // heurísticas por ID conhecidas
  if (n.includes('credito')) return 'crédito';
  if (n.includes('debito'))  return 'débito';
  if (n.includes('pix'))     return 'pix';
  return 'outros';
}
