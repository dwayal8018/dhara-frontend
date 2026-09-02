function d(l,t,s){if(t.length===0)return;let o=s??Object.keys(t[0]).map(e=>({key:e,label:e})),a=o.map(e=>`"${e.label}"`).join(","),i=t.map(e=>o.map(f=>{let r=e[f.key];return r==null?'""':`"${String(r).replace(/"/g,'""')}"`}).join(",")).join(`
`),b=a+`
`+i,u=new Blob(["\uFEFF"+b],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(u),n=document.createElement("a");n.href=c,n.download=l,n.click(),URL.revokeObjectURL(c)}export{d as a};
