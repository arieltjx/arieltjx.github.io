const books = {'2023-2024':{title:'2023–2024 Engineering Notebook',pages:81},'2024-2025':{title:'2024–2025 Engineering Notebook',pages:40}};
const params = new URLSearchParams(location.search);
const bookKey = Object.hasOwn(books,params.get('book')) ? params.get('book') : '2023-2024';
const book = books[bookKey];
let currentPage = Math.min(book.pages,Math.max(1,Number.parseInt(params.get('page'),10)||1));
const pageImage = document.getElementById('notebook-page');
const pageSelect = document.getElementById('page-select');
const previousPage = document.getElementById('previous-page');
const nextPage = document.getElementById('next-page');
const stage = document.getElementById('book-stage');
const zoomButton = document.getElementById('notebook-zoom');
const pageError = document.getElementById('page-error');
document.getElementById('book-title').textContent = book.title;
document.title = `${book.title} | Hansheng Tian`;
document.querySelector(`[data-book="${bookKey}"]`).setAttribute('aria-current','page');
document.getElementById('page-total').textContent = `of ${book.pages}`;
for(let i=1;i<=book.pages;i++){ const option=document.createElement('option');option.value=i;option.textContent=i;pageSelect.append(option); }
const imagePath = n => `https://hansheng-tian.kg5sffbhcb.chatgpt.site/assets/notebooks/${bookKey}/${String(n).padStart(3,'0')}.webp`;
function showPage(number,direction=''){
 currentPage=Math.max(1,Math.min(book.pages,number));
 const caption=`${book.title} · Page ${currentPage} of ${book.pages}`;
 stage.classList.remove('turn-next','turn-previous');stage.setAttribute('aria-busy','true');pageError.hidden=true;
 pageImage.alt=caption;pageImage.src=imagePath(currentPage);
 zoomButton.dataset.image=pageImage.src;zoomButton.dataset.caption=caption;
 pageSelect.value=currentPage;previousPage.disabled=currentPage===1;nextPage.disabled=currentPage===book.pages;
 document.getElementById('page-status').textContent=caption;
 history.replaceState(null,'',`?book=${bookKey}&page=${currentPage}`);
 if(direction)requestAnimationFrame(()=>stage.classList.add(`turn-${direction}`));
 for(const n of [currentPage-1,currentPage+1])if(n>=1&&n<=book.pages){const preload=new Image();preload.src=imagePath(n);}
}
pageImage.addEventListener('load',()=>stage.setAttribute('aria-busy','false'));
pageImage.addEventListener('error',()=>{stage.setAttribute('aria-busy','false');pageError.hidden=false;});
previousPage.addEventListener('click',()=>showPage(currentPage-1,'previous'));
nextPage.addEventListener('click',()=>showPage(currentPage+1,'next'));
pageSelect.addEventListener('change',()=>showPage(Number(pageSelect.value)));
document.getElementById('retry-page').addEventListener('click',()=>showPage(currentPage));
document.getElementById('enlarge-page').addEventListener('click',()=>zoomButton.click());
document.addEventListener('keydown',event=>{
 if(document.querySelector('dialog[open]')||['SELECT','INPUT','TEXTAREA','BUTTON'].includes(event.target.tagName)||event.altKey||event.ctrlKey||event.metaKey)return;
 if(event.key==='ArrowRight'){event.preventDefault();showPage(currentPage+1,'next');}
 if(event.key==='ArrowLeft'){event.preventDefault();showPage(currentPage-1,'previous');}
});
showPage(currentPage);
