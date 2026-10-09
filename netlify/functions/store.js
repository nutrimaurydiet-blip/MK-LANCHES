const { connectLambda, getStore } = require('@netlify/blobs');
const { isAdmin } = require('./auth');
const CARAMELO = require('../../data/caramelo-catalog.json');
const DEFAULT = {
  company:{name:'MK Lanches',bio:'O melhor dos lanches artesanais para vc e sua família!',address:'Av. Belo Horizonte, 4466',city:'Rolim de Moura - RO',hours:'18:00–23:30',whatsapp:'5569984496963',instagram:'@mk_lanchesrm',logo:'assets/logo-mk-lanches.jpg'},
  categories:[{id:'lanches',name:'Lanches',icon:'🍔',active:true},{id:'porcoes',name:'Porções',icon:'🍟',active:true},{id:'bebidas',name:'Bebidas',icon:'🥤',active:true},{id:'combos',name:'Combos',icon:'🌭',active:true}],
  products:[
{id:'1',name:'X-Bacon',category:'lanches',price:22,promoPrice:null,active:true,image:'assets/x-bacon.jpg',description:'Pão, hambúrguer, queijo, bacon, alface, tomate e maionese.',ingredients:'Pão, hambúrguer, queijo, bacon, alface, tomate e maionese.',addons:[]},
{id:'2',name:'X-Tudo',category:'lanches',price:28,promoPrice:null,active:true,image:'assets/x-tudo.jpg',description:'Pão, 2 hambúrgueres, queijo, bacon, alface, tomate, milho, ervilha e maionese.',ingredients:'Pão, 2 hambúrgueres, queijo, bacon, alface, tomate, milho, ervilha e maionese.',addons:[]},
{id:'3',name:'X-Frango',category:'lanches',price:20,promoPrice:null,active:true,image:'assets/x-frango.jpg',description:'Pão, filé de frango, queijo, alface, tomate e maionese.',ingredients:'Pão, filé de frango, queijo, alface, tomate e maionese.',addons:[]},
{id:'4',name:'X-Modão',category:'lanches',price:25,promoPrice:null,active:true,image:'assets/x-modao.jpg',description:'Lanche artesanal da casa.',ingredients:'',addons:[]},
{id:'5',name:'Cachorro-quente',category:'lanches',price:10,promoPrice:null,active:true,image:'assets/hot-dog.jpg',description:'Cachorro-quente ao molho.',ingredients:'',addons:[]},
{id:'6',name:'Batata frita',category:'porcoes',price:25,promoPrice:null,active:true,image:'https://www.nickysfrangoecostela.com.br/assets/img/produto-batata-frita.jpg',description:'Porção de batata frita.',ingredients:'',addons:[]},
{id:'7',name:'Calabresa 400g',category:'porcoes',price:26,promoPrice:null,active:true,image:'assets/porcao.jpg',description:'Porção de calabresa 400g.',ingredients:'',addons:[]},
{id:'8',name:'Combo Casal',category:'combos',price:40,promoPrice:null,active:true,image:'assets/combo-casal.jpg',description:'Combo para compartilhar.',ingredients:'',addons:[]},
{id:'9',name:'Refrigerante lata',category:'bebidas',price:7,promoPrice:null,active:true,image:'https://santaluzia.vtexassets.com/arquivos/ids/997380/556297.jpg?v=638525861586730000',description:'Refrigerante lata 350 ml.',ingredients:'',addons:[]},
{id:'10',name:'Refrigerante 600 ml',category:'bebidas',price:8,promoPrice:null,active:true,image:'https://www.drogariaminasbrasil.com.br/media/webp/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/image/59667d143/coca-cola-tradicional-600ml_jpg.webp',description:'Refrigerante 600 ml.',ingredients:'',addons:[]},
{id:'11',name:'Refrigerante 1 L',category:'bebidas',price:11,promoPrice:null,active:true,image:'https://carrefourbrfood.vtexassets.com/arquivos/ids/18900734/coca-cola-1-litro-1.jpg?v=637590176337130000',description:'Refrigerante 1 litro.',ingredients:'',addons:[]},
{id:'12',name:'Refrigerante 2 L',category:'bebidas',price:15,promoPrice:null,active:true,image:'https://assets.ibecom.com.br/ib.item.image.large/l-6914a2bb4f5945e096287835120c831e.png',description:'Refrigerante 2 litros.',ingredients:'',addons:[]},
{id:'13',name:'Água mineral',category:'bebidas',price:5,promoPrice:null,active:true,image:'https://down-br.img.susercontent.com/file/sg-11134201-7rblq-lm8kys2zg3mhaa',description:'Água mineral 500 ml.',ingredients:'',addons:[]},
{id:'14',name:'Água com gás',category:'bebidas',price:5,promoPrice:null,active:true,image:'https://d3gdr9n5lqb5z7.cloudfront.net/fotos/983651-17-02-2023-17-00-17-182.jpg',description:'Água com gás 500 ml.',ingredients:'',addons:[]},
{id:'15',name:'H2O 500 ml',category:'bebidas',price:9,promoPrice:null,active:true,image:'https://www.gimba.com.br/objetosmidia/ExibirObjetoMidia?id=102534',description:'H2O 500 ml.',ingredients:'',addons:[]},
{id:'16',name:'Água tônica',category:'bebidas',price:7,promoPrice:null,active:true,image:'https://bistek.vtexassets.com/arquivos/ids/211081/984744%20Agua%20Tonica%20Schweppes%20350ml.png?v=639047682752130000',description:'Água tônica 350 ml.',ingredients:'',addons:[]}
]};
exports.handler=async(event)=>{
  try {
    connectLambda(event);
    const storeId = event.queryStringParameters?.store === 'caramelo' ? 'caramelo' : 'mk';
    const store=getStore({name:'mk-lanches-data'});
    const catalogKey = `catalog-${storeId}`;
    const initialData = storeId === 'caramelo' ? CARAMELO : DEFAULT;
    if(event.httpMethod==='GET'){
      let data=await store.get(catalogKey,{type:'json'});
      if(!data){
        // Preserve the existing live MK catalog when migrating from the legacy single-catalog key.
        const legacy = storeId === 'mk' ? await store.get('catalog',{type:'json'}) : null;
        data = legacy || initialData;
        await store.setJSON(catalogKey,data);
      }
      return json(200,data);
    }
    if(event.httpMethod==='PUT'){
      if(!await isAdmin(event))return json(401,{error:'Não autorizado.'});
      let data;
      try{data=JSON.parse(event.body||'{}')}catch{return json(400,{error:'JSON inválido.'})}
      const checked=validateCatalog(data);
      if(!checked.ok)return json(400,{error:checked.error});
      await store.setJSON(catalogKey,checked.data);
      return json(200,{ok:true,data:checked.data});
    }
    return json(405,{error:'Método não permitido'});
  } catch(error){
    console.error('MK store error:',error);
    return json(500,{error:'Não foi possível acessar os dados da loja agora.'});
  }
};
function cleanText(v,max=1000){return String(v??'').trim().slice(0,max)}
function validateCatalog(input){
  if(!input||typeof input!=='object'||!input.company||!Array.isArray(input.categories)||!Array.isArray(input.products))return {ok:false,error:'Catálogo inválido.'};
  if(input.categories.length>100||input.products.length>500)return {ok:false,error:'Catálogo excede o limite permitido.'};
  const data={company:{...input.company},categories:[],products:[]};
  for(const key of ['name','bio','address','city','hours','whatsapp','instagram','logo','tagline','primaryColor','accentColor'])data.company[key]=cleanText(input.company[key],500);
  if(!data.company.name)return {ok:false,error:'O nome da loja é obrigatório.'};
  if(data.company.whatsapp){
    const whatsapp=data.company.whatsapp.replace(/\D/g,'');
    if(!/^\d{10,15}$/.test(whatsapp))return {ok:false,error:'WhatsApp inválido.'};
    data.company.whatsapp=whatsapp;
  }
  for(const key of ['primaryColor','accentColor'])if(data.company[key]&&!/^#[0-9a-f]{6}$/i.test(data.company[key]))return {ok:false,error:'Cor inválida. Use o formato hexadecimal #RRGGBB.'};
  if(data.company.logo&&!validImageUrl(data.company.logo))return {ok:false,error:'URL de logo inválida.'};
  for(const c of input.categories){
    if(!c||!String(c.id||'')||!String(c.name||'').trim()||!/^[A-Za-z0-9_-]+$/.test(String(c.id)))return {ok:false,error:'Existe uma categoria inválida.'};
    data.categories.push({id:cleanText(c.id,80),name:cleanText(c.name,100),icon:cleanText(c.icon,20),active:Boolean(c.active)});
  }
  const catIds=new Set(data.categories.map(c=>c.id));
  for(const p of input.products){
    if(!p||!String(p.id||'')||!String(p.name||'').trim()||!/^[A-Za-z0-9_-]+$/.test(String(p.id)))return {ok:false,error:'Existe um produto inválido ou sem nome.'};
    const price=Number(p.price);
    const promo=(p.promoPrice===null||p.promoPrice===''||p.promoPrice===undefined)?null:Number(p.promoPrice);
    if(!Number.isFinite(price)||price<0||price>999999)return {ok:false,error:`Preço inválido no produto ${cleanText(p.name,100)}.`};
    if(promo!==null&&(!Number.isFinite(promo)||promo<0||promo>=price))return {ok:false,error:`Preço promocional inválido no produto ${cleanText(p.name,100)}.`};
    if(!catIds.has(String(p.category)))return {ok:false,error:`Categoria inválida no produto ${cleanText(p.name,100)}.`};
    if(p.image&&!validImageUrl(p.image))return {ok:false,error:`Imagem inválida no produto ${cleanText(p.name,100)}.`};
    const addons=Array.isArray(p.addons)?p.addons.slice(0,50).map(a=>({id:cleanText(a.id||`addon-${Math.random()}`,100),name:cleanText(a.name,100),price:Number(a.price||0)})).filter(a=>a.name&&Number.isFinite(a.price)&&a.price>=0&&a.price<=999999):[];
    if(addons.length>50)return {ok:false,error:'Limite de adicionais excedido.'};
    data.products.push({id:cleanText(p.id,80),name:cleanText(p.name,150),category:cleanText(p.category,80),price:Math.round(price*100)/100,promoPrice:promo===null?null:Math.round(promo*100)/100,active:Boolean(p.active),image:cleanText(p.image,1000),description:cleanText(p.description,2000),ingredients:cleanText(p.ingredients,3000),addons});
  }
  return {ok:true,data};
}
function validImageUrl(value){
  const url=cleanText(value,1000);
  return /^assets\/(?!.*\.\.)[A-Za-z0-9._/-]+$/.test(url)||/^\/api\/image\?key=[A-Za-z0-9_-]+$/.test(url)||/^https:\/\/[^\s"'<>\\]+$/i.test(url);
}
function json(status,body){return {statusCode:status,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(body)}}
