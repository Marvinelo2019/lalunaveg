export const CL_FIJOS = [
  {id:'katherine',nombre:'Katherine Lorenzo + esposo',ini:'KL',tipo:'90',metodo:'Recurrente tarjeta',base:2,fijo:true},
  {id:'claudia',  nombre:'Claudia Cosenza',           ini:'CC',tipo:'45',metodo:'Transferencia',      base:1,fijo:true},
  {id:'yazmin',   nombre:'Yazmin Avila',              ini:'YA',tipo:'45',metodo:'Transferencia',      base:1,fijo:true},
  {id:'marian',   nombre:'Marian Alburez',            ini:'MA',tipo:'45',metodo:'Transferencia',      base:1,fijo:true},
  {id:'lester',   nombre:'Lester Menendez',           ini:'LM',tipo:'45',metodo:'Transferencia',      base:1,fijo:true},
  {id:'gabriela', nombre:'Gabriela Galindo',          ini:'GG',tipo:'35',metodo:'Recurrente tarjeta', base:1,fijo:true},
  {id:'cristian', nombre:'Cristian Arriola',          ini:'CA',tipo:'35',metodo:'Transferencia',      base:1,fijo:true},
  {id:'regina',   nombre:'Regina Herrera',            ini:'RH',tipo:'25e',metodo:'Transferencia',     base:1,fijo:true},
  {id:'ericka',   nombre:'Ericka Bolanos',            ini:'EB',tipo:'25f',metodo:'Transferencia',     base:1,fijo:true},
];

export let CL_NUEVOS = [];
export const setCLNuevos = (arr) => { CL_NUEVOS = arr; };
export const todos = () => [...CL_FIJOS, ...CL_NUEVOS];

export const PLAN   = {'90':275,'45':275,'35':225,'25e':150,'25f':125};
export const SUE    = {'90':45, '45':45, '35':35, '25e':25, '25f':25};
export const TAG    = {'90':'familiar Q275','45':'normal Q275','35':'amigos Q225','25e':'enfermedad Q150','25f':'familia Q125'};
export const TNOMBRE= {'90':'Familiar doble','45':'Normal','35':'Amigos/Iglesia','25e':'Enfermedad','25f':'Familia'};

