"""Build the offline HTML from sanitized public data. Python 3, standard library only."""
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'data/atlas.json').read_text(encoding='utf-8'))
assert set(data)=={'paper-data','region-study-data','framework-data','embedded-discussion','revision-data'}
assert data['embedded-discussion']=={'ids':[],'notes':{}},'Public builds cannot embed personal notes'
papers=data['paper-data'];ids={p['id'] for p in papers}
assert len(ids)==len(papers),'Duplicate record ID'
dois=[p['doi'].lower() for p in papers if p.get('doi')]
assert len(set(dois))==len(dois),'Duplicate DOI'
assert all(x.get('paper') in ids for x in data['framework-data']['sources'].values()),'Unregistered framework source'
shell=(ROOT/'src/shell.html').read_text(encoding='utf-8')
for key,value in data.items():
 token='@@'+key+'@@';assert shell.count(token)==1,token
 shell=shell.replace(token,json.dumps(value,ensure_ascii=False,indent=2).replace('<','\\u003c'))
assert not re.search(r'[\u4e00-\u9fff]',shell),'English release contains untranslated Chinese'
assert not re.search(r'AppData|BaiduSyncdisk|2027\u56fd\u9752|C:\\\\Users',shell,re.I),'Local/private path in release'
assert '@@paper-data@@' not in shell
(ROOT/'index.html').write_text(shell,encoding='utf-8',newline='\n')
print(json.dumps({'version':data['revision-data']['version'],'references':len(papers),'mainRecords':sum(not p.get('frameworkOnly') for p in papers),'frameworkSources':sum(bool(p.get('frameworkOnly')) for p in papers)}))
