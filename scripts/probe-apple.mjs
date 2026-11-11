const list=['https://support.apple.com/en-us/108044','https://support.apple.com/en-us/111831','https://support.apple.com/en-us/125090'];
for(const url of list){
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; SpecVerse factual-specs research)',Accept:'text/html'}});
  const html=await response.text();
  console.log('\nURL',url,'HTTP',response.status,'size',html.length,'title',html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  for(const term of ['iPhone 15 - Tech Specs','Capacity','See the tech specs for iPhone 15','<h2','<h3','<main','"articleBody"']){
    let i=html.toLowerCase().indexOf(term.toLowerCase());
    console.log('TERM',term,'index',i, 'snippet',html.slice(Math.max(i-160,0),Math.max(i,0)+410).replace(/\s+/g,' ').slice(0,570));
  }
  console.log('heading-snippet:',[...html.matchAll(/<(h[1-4])[^>]*>([\s\S]{0,200}?)<\/\1>/gi)].slice(0,8).map(x=>x[0].replace(/\s+/g,' ').slice(0,200)));
  console.log('apple hrefs', [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,300}?)<\/a>/gi)].filter(m=>/tech spec|technical spec|See the tech specs for iPhone 15/i.test(m[2])).slice(0,4).map(m=>m[0].replace(/\s+/g,' ').slice(0,380)));
}