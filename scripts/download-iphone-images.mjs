import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {IPHONE_IMAGE_FILES} from '../iphone-images.js';

// Download openly licensed device depictions from the Wikimedia Commons file pages.
// NEVER copy/redistribute photographs from apple.com without permission.
const output=new URL('../public/iphone-images/',import.meta.url);
await mkdir(output,{recursive:true});
const errors=[];
let saved=0;
const metadata=[];
for(const [id,{file,hash}] of Object.entries(IPHONE_IMAGE_FILES)){
  const basename=file.replaceAll(' ','_');
  const computed=createHash('md5').update(basename).digest('hex').slice(0,2);
  if(computed!==hash)throw new Error('Checksum/path mismatch for '+file);
  const suffix=file.slice(file.lastIndexOf('.')).toLowerCase();
  if(!['.svg','.jpg','.jpeg','.png'].includes(suffix))throw new Error('Unsupported file format: '+file);
  const encoded=encodeURIComponent(basename);
  const host='https://upload.wikimedia.org/wikipedia/commons/';
  const url=host+(suffix==='.svg'?hash[0]+'/'+hash+'/'+encoded:'thumb/'+hash[0]+'/'+hash+'/'+encoded+'/480px-'+encoded);
  const source='https://commons.wikimedia.org/wiki/File:'+encoded;
  const destination=join(output.pathname,id+suffix);
  let success=false;
  for(let attempt=0;attempt<3&&!success;attempt++){
    try{
      const response=await fetch(url,{
        headers:{'User-Agent':'SpecVerseLicensedMedia/1.0 (https://github.com/iamumar736/specverse-site)','Accept':'image/*'},
        signal:AbortSignal.timeout(25000),
      });
      if(!response.ok)throw new Error('HTTP '+response.status);
      const bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length>10_000_000||bytes.length<200)throw new Error('Unexpected file size '+bytes.length);
      const start=bytes.subarray(0,256).toString('utf8');
      const isSvg=suffix==='.svg'&&/<svg\b/i.test(start);
      const isJpg=['.jpg','.jpeg'].includes(suffix)&&bytes[0]===0xff&&bytes[1]===0xd8;
      const isPng=suffix==='.png'&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
      if(!(isSvg||isJpg||isPng))throw new Error('File content does not match extension');
      await writeFile(destination,bytes);
      metadata.push({id,file,source,local:'/iphone-images/'+id+suffix});
      saved++;
      console.log('Downloaded '+id+' ('+bytes.length+' bytes)');
      success=true;
    }catch(error){
      console.warn(id+' attempt '+(attempt+1)+': '+error.message);
      if(attempt<2)await new Promise(r=>setTimeout(r,1000*(attempt+1)));
    }
  }
  if(!success)errors.push(id);
  await new Promise(r=>setTimeout(r,250));
}
await writeFile(join(output.pathname,'SOURCES.json'),JSON.stringify({description:'Licensed community imagery; not official Apple press photographs. Authors, individual licenses, and source files are listed on the linked Wikimedia Commons file pages.',images:metadata},null,2)+'\n');
console.log('Saved '+saved+' of '+Object.keys(IPHONE_IMAGE_FILES).length+' assets. Failed: '+errors.join(', '));
if(saved===0)process.exitCode=1;
