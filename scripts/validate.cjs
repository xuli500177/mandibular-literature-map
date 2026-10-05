// Source/data and interaction regression checks; these do not replace browser QA.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const target=process.argv[2]||path.join(__dirname,'..','index.html');
const html=fs.readFileSync(target,'utf8'),english=/<html[^>]+lang="en"/.test(html);
let checks=0;const ok=(value,label)=>{assert(value,label);checks++};const eq=(a,b,label)=>{assert.deepStrictEqual(a,b,label);checks++};
if(english){ok(!/[\u4e00-\u9fff]/.test(html),'English release contains Chinese');ok(!/AppData|BaiduSyncdisk|2027\u56fd\u9752|C:\\Users|\.codex[\\/]/i.test(html),'Private/local path in release');}
const blocks=Object.fromEntries([...html.matchAll(/<script\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>[m[1],m[2]]));
const papers=JSON.parse(blocks['paper-data']),regional=JSON.parse(blocks['region-study-data']),fw=JSON.parse(blocks['framework-data']),revision=JSON.parse(blocks['revision-data']);
eq(papers.length,103,'Independent references');eq(papers.filter(p=>!p.frameworkOnly).length,96,'Main records');eq(papers.filter(p=>p.frameworkOnly).length,7,'Additional framework sources');eq(fw.frameworks.length,5);
eq(JSON.parse(blocks['embedded-discussion']),{ids:[],notes:{}},'No embedded private notes');
const ids=new Set(papers.map(p=>p.id));eq(ids.size,papers.length,'Unique IDs');const dois=papers.filter(p=>p.doi).map(p=>p.doi.toLowerCase());eq(new Set(dois).size,dois.length,'Unique DOIs');
const units=new Set();let claimCount=0;
for(const p of papers){ok(/^https:\/\//.test(p.source),p.id+' source');ok(p.bibliography.authors.length>0,p.id+' authors');ok(!/[<>\uFFFD]/.test(p.bibliography.title),p.id+' plain bibliographic title');ok(['cn','overseas','international'].includes(p.geo),p.id+' team category');ok(p.bibliography.title&&p.claim&&p.boundary,p.id+' core fields');for(const u of p.evidenceUnits){ok(u.id.startsWith(p.id+'-')&&!units.has(u.id),u.id+' unique');units.add(u.id);claimCount++;ok(u.model&&u.experiment&&u.outcome&&u.limit&&u.anchor&&u.reading&&/^https:\/\//.test(u.url),u.id+' claim/model/source');}}
eq(claimCount,16,'Linked claims');
for(const [key,s] of Object.entries(fw.sources))ok(ids.has(s.paper),key+' registered source');
for(const s of regional.studies){ok(ids.has(s.id),s.id+' regional record');for(const e of [...s.edges,...(s.therapy?[s.therapy]:[])])for(const uid of e.unitIds||[])ok(units.has(uid)&&uid.startsWith(s.id+'-'),s.id+' arrow to original claim');}
for(const p of papers.filter(p=>p.frameworkOnly))eq(p.regions,['reviews'],p.id+' separate source area');
const elements=new Map(),docEvents={},winEvents={},historyEntries=[];let historyIndex=-1,loc=new URL('https://example.org/map/');
function node(id=''){const listeners={};return {id,textContent:blocks[id]||'',innerHTML:'',style:{},dataset:{},value:'',open:false,tagName:'DIV',children:[],isConnected:true,attrs:{},
 classList:{toggle(){},add(){},remove(){},contains(){return false}},addEventListener(k,f){(listeners[k]??=[]).push(f)},
 setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]??null},removeAttribute(k){delete this.attrs[k]},hasAttribute(k){return k in this.attrs},querySelectorAll(){return[]},
 querySelector(sel){return sel==='[data-copy-status]'?this.children.find(n=>'copyStatus' in n.dataset)||null:null},closest(sel){return this.host?.open?this.host:null},matches(){return false},contains(n){return this.children.includes(n)},
 appendChild(n){n.host=this;this.children.push(n);return n},remove(){if(this.host)this.host.children=this.host.children.filter(n=>n!==this)},select(){document.selectedHost=this.host},focus(){document.activeElement=this},scrollIntoView(){},showModal(){this.open=true},
 close(){this.open=false;for(const fn of listeners.close||[])fn({currentTarget:this})},getBoundingClientRect(){return {top:0,left:0,width:100,height:100,right:100,bottom:100}}};}
function elem(id){if(!elements.has(id))elements.set(id,node(id));return elements.get(id)}
const document={getElementById:elem,querySelectorAll(){return[]},querySelector(sel){return sel==='dialog[open]'?[...elements.values()].find(n=>n.open)||null:null},addEventListener(k,f){(docEvents[k]??=[]).push(f)},body:node('body'),createElement(tag){const n=node();n.tagName=tag.toUpperCase();return n},execCommand(){return !!document.selectedHost?.open},selectedHost:null};document.activeElement=document.body;
const history={pushState(state,_,url){loc=new URL(url,loc);historyEntries.splice(++historyIndex);historyEntries.push({url:loc.href,state:JSON.parse(JSON.stringify(state))});},replaceState(state,_,url){loc=new URL(url||loc,loc);const entry={url:loc.href,state:JSON.parse(JSON.stringify(state))};if(historyIndex<0){historyIndex=0;historyEntries.push(entry)}else historyEntries[historyIndex]=entry;},get state(){return historyEntries[historyIndex]?.state}};
const window={get location(){return loc},history,innerWidth:1400,innerHeight:900,scrollY:0,addEventListener(k,f){(winEvents[k]??=[]).push(f)},scrollTo(a,b){this.scrollY=typeof a==='object'?a.top:b||0},matchMedia(){return {matches:true}},print(){}};
const clipboard={value:'',async writeText(value){this.value=value}};
const context=vm.createContext({document,window,localStorage:{getItem(){return null},setItem(){}},navigator:{clipboard},console,setTimeout(){return 0},clearTimeout(){},URL,URLSearchParams,Blob,innerWidth:1400,innerHeight:900});
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(/type="application\/json"/.test(m[1]))continue;new vm.Script(m[2]).runInContext(context);}
const run=code=>vm.runInContext(code,context);const json=code=>JSON.parse(JSON.stringify(run(code)));
eq(run('Object.keys(REGIONS).length'),18);
for(const r of run('Object.keys(REGIONS)')){run(`S.studyRegion=${JSON.stringify(r)};S.region=${JSON.stringify(r)};S.view='region';S.studyFramework='all';S.studyGroup='all';`);let h=run('regionStudiesHTML()');ok(h.length>1000&&!h.includes('undefined'),r+' regional render');for(const f of run('SYSTEMS.frameworks.map(f=>f.id)')){run(`S.studyFramework=${JSON.stringify(f)}`);ok(run('regionStudiesHTML()').length>1000,r+'/'+f);}}
for(const f of run('SYSTEMS.frameworks.map(f=>f.id)')){run(`S.view='framework';S.framework=${JSON.stringify(f)};S.frameworkRegion='all';`);ok(run('frameworkHTML()').length>2000,f+' framework render');}
for(const p of papers){const d=run(`detailHTML(byId[${JSON.stringify(p.id)}])`);ok(d.includes(p.id)&&!d.includes('undefined'),p.id+' detail render');if(p.evidenceUnits.length)ok(d.indexOf('claim-evidence')<d.indexOf('paper-extra'),p.id+' claims beside evidence');}
run("S.view='library';S.query='';S.region='all';S.geo='all';S.scope='jaw';S.species='all';S.stage='all';S.studyFramework='all';S.showPreprints=false;");eq(run('filtered(false).length'),101,'Default references');run('S.showPreprints=true');eq(run('filtered(false).length'),103,'Including preprints');
for(const q of ['R01','r01',papers[0].doi,'https://doi.org/'+papers[0].doi,'DOI: '+papers[0].doi]){run(`S.query=${JSON.stringify(q)}`);eq(json('filtered(false).map(p=>p.id)'),['R01'],'ID/DOI search '+q);}
run("S.query='F04';");eq(json('filtered(false).map(p=>p.id)'),['F04'],'Additional reference search');
run("S.query='';S.species='human';S.stage='embryo';");ok(run('filtered(false).length')>0,'Combined model-context filter');run("S.species='all';S.stage='all';");
eq(json('byId.R18.bibliography.authors'),['Qianying Lin','Conghui Zhang','Kaijie Zhang','Siyu Jin','Longjian Xue','Wei Ji'],'Publisher author order');
const citation=run('citationText(byId.R18)');ok(citation.startsWith('Qianying Lin, Conghui Zhang'),'Citation full authors');ok(citation.includes(papers.find(p=>p.id==='R18').doi),'Citation DOI');
const csv=run('csvText([byId.R18])');ok(csv.includes('Qianying Lin; Conghui Zhang')&&!csv.includes('Chinese guided title'),'CSV author/title fields');if(english)ok(!/[\u4e00-\u9fff]/.test(csv),'CSV English');
run("S.ids=['R01','R18','R33'];S.notes={R18:'private test note'};S.view='discussion';");const compare=run('discussionHTML()');eq((compare.match(/<tbody>[\s\S]*?<\/tbody>/)||[''])[0].match(/<tr>/g).length,11,'Comparison merged rows');ok(compare.includes('private test note'),'Comparison notes retained');
function visit(hash){loc=new URL('https://example.org/map/'+hash);return run('applyRoute()');}
ok(visit('#paper=R95'),'Study link');eq(json('[S.view,S.selected]'),['library','R95']);ok(visit('#view=region&region=alveolar&lens=regional'),'Region+framework link');eq(json('[S.view,S.studyRegion,S.studyFramework]'),['region','alveolar','regional']);
for(const scope of ['jaw','embryo','reference']){ok(visit('#view=map&scope='+scope),'Scope link '+scope);eq(run('S.scope'),scope);eq(run('currentRoute().scope'),scope);}
const before=json('S');ok(!visit('#paper=R999'),'Invalid ID rejected');eq(json('S'),before,'Invalid route leaves state unchanged');ok(!visit('#view=map&scope=unknown'),'Invalid scope rejected');
visit('#view=region&region=periosteum&lens=coordination');run("S.query='masseter';S.geo='cn';S.species='mouse';S.stage='embryo';render();");const originalIndex=historyIndex;
run("selectPaper('R13');updateShareState();");const modalIndex=historyIndex;ok(elem('study-dialog').open,'Paper dialog open');run("openSystemFramework('regional','periosteum');");const frameworkIndex=historyIndex;ok(frameworkIndex>modalIndex,'Framework adds route');
function restoreAt(index){historyIndex=index;loc=new URL(historyEntries[index].url);run('routeChanged({type:"popstate",state:window.history.state})');}
restoreAt(originalIndex);eq(json('[S.view,S.query,S.geo,S.species,S.stage,S.studyFramework]'),['region','masseter','cn','mouse','embryo','coordination'],'Back restores local filters');ok(!elem('study-dialog').open,'Back closes paper dialog');restoreAt(modalIndex);ok(elem('study-dialog').open,'Forward restores modal');eq(elem('study-dialog').dataset.paper,'R13');eq(run('S.view'),'region','Forward retains region context');
const oldIds=json('S.ids'),oldNotes=json('S.notes');ok(!JSON.stringify(historyEntries).includes('private test note'),'History excludes notes');eq(json('S.ids'),oldIds);eq(json('S.notes'),oldNotes);
// Browser-discovered regressions: article type is distinct from a cross-topic theme.
ok(!/Review entry|综述入口/.test(run('labelTopic(byId.R95)')),'Cross-topic original study is not labeled a review');
ok(/Two months|2月龄/.test(run('byId.R33.modelContexts[0].stageLabel')),'R33 checked age in model context');
for(const id of ['R95','R96'])ok(run(`regionalById.${id}.site!==byId.${id}.boundary`),id+' site separate from conclusion scope');
for(const [region,cfg] of Object.entries(regional.regions)){run(`S.studyRegion=${JSON.stringify(region)}`);const diagram=run(`regionSketchSVG(${JSON.stringify(cfg.kind)})`);ok(diagram.includes('diagram-labels')&&diagram.includes('<tspan'),region+' width-aware text layer');ok(diagram.indexOf('diagram-shapes')<diagram.indexOf('diagram-labels'),region+' geometry behind labels');}
const mapHit=run("hotspot('alveolar',430,330,30,230,240)");ok(mapHit.includes('hotspot-scaffold')&&mapHit.includes('anchor-hit'),'Decorative leader separate from label and marker targets');
loc=new URL('https://example.org/map/');run('routeChanged({type:"hashchange"})');eq(run('S.view'),'map');ok(!elem('study-dialog').open,'Empty hash closes dialog');eq(json('S.notes'),oldNotes,'Empty route preserves notes');
visit('#lens=coordination');const start=historyIndex;run("openSystemRegion('periosteum');");eq(historyIndex,start+1,'One click creates one history entry');eq(json('[S.view,S.studyFramework]'),['region','coordination']);
(async()=>{run("S.view='region';selectPaper('R18');");const d=elem('study-dialog'),focus=node('copy-button');focus.host=d;document.activeElement=focus;clipboard.writeText=async()=>{throw Error('denied')};eq(await run("copyText('test citation',RT.citationCopied)"),true,'Fallback copy inside modal');eq(document.selectedHost,d,'Copy host is active dialog');eq(document.activeElement,focus,'Copy restores focus');ok(d.querySelector('[data-copy-status]')?.textContent,'Dialog copy status');
run("selectPaper('R96');");ok(!d.querySelector('[data-copy-status]'),'Switching paper clears previous copy status');
let releaseCopy;clipboard.writeText=()=>new Promise(resolve=>{releaseCopy=resolve});const pendingCopy=run("copyText('old paper citation',RT.citationCopied)");run("selectPaper('R18');");releaseCopy();await pendingCopy;ok(!d.querySelector('[data-copy-status]'),'Delayed copy feedback cannot appear in a different paper');
run('copyFeedback(RT.citationCopied)');d.close();ok(!d.querySelector('[data-copy-status]'),'Closing dialog clears copy feedback');
console.log(JSON.stringify({version:revision.version,language:english?'en':'zh',records:papers.length,mainRecords:96,frameworkSources:7,linkedClaims:claimCount,checks,defaultReferences:101,privacyAndInteractionChecks:true,browserQARequired:true}));})().catch(e=>{console.error(e);process.exitCode=1});
