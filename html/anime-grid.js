const htmlEl = document.documentElement;

const Caches = {};
var query = `
query ( $page: Int, $perPage: Int, $search: String) {
    Page(page: $page, perPage: $perPage) {
      characters(search: $search) {
        name {
          full
          native
        }
        image {
          medium
        }
      }
    }
  }
`;

const graphQLGet = async (keyword)=>{
    if(Caches[keyword]) return Caches[keyword];
    htmlEl.setAttribute('data-no-touch',true);
    var variables = {
        search: keyword,
    };
    var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };
    const f = await fetch(url, options);
    const data = await f.json();
    Caches[keyword] = data.data.Page.characters;
    console.log(data)
    htmlEl.setAttribute('data-no-touch',false);
    return Caches[keyword];
}

const get = async (url)=>{

    if(Caches[url]) return Caches[url];
    htmlEl.setAttribute('data-no-touch',true);
    const f = await fetch(url);
    const data = await f.json();
    Caches[url] = data;
    htmlEl.setAttribute('data-no-touch',false);
    return data;
}




const Images = {};

const loadImage = (src,onOver)=>{
    if(Images[src]) return onOver(Images[src]);
    const el = new Image();
    el.crossOrigin = 'Anonymous';
    el.src = src;
    el.onload = ()=>{
        onOver(el)
        Images[src] = el;
    }
};


const typeTexts = `最佳男主
最佳女主
最佳男配
最佳女配
我咋喜欢这人
爱过
讨厌
妈！
爸！
心灵导师
最憧憬
最强
最惨
最心机
最变态`;

const types = typeTexts.trim().split(/\n+/g);


const bangumiLocalKey = 'margiconch-animes-grid';


let bangumis = [];


const generatorDefaultBangumis = ()=> {
    bangumis = new Array(types.length).fill(null);
}

const getBangumiIdsText = ()=> bangumis.map(i=>String( i || 0 )).join(',')

const getBangumisFormLocalStorage = ()=>{
    if(!window.localStorage) return generatorDefaultBangumis();

    const bangumisText = localStorage.getItem(bangumiLocalKey);
    if(!bangumisText) return generatorDefaultBangumis();

    bangumis = bangumisText.split(/,/g).map(i=>/^\d+$/.test(i) ? +i : i);
}

getBangumisFormLocalStorage();
const saveBangumisToLocalStorage = ()=>{
    localStorage.setItem(bangumiLocalKey,getBangumiIdsText());
};


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const bodyMargin = 20;
const contentWidth = 600;
const contentHeight = 560;


const col = 5;
const row = 3;

const colWidth = Math.ceil(contentWidth / col);
const rowHeight = Math.ceil(contentHeight / row);
const titleHeight = 40;
const fontHeight = 24;

const width = contentWidth + bodyMargin * 2;
const height = contentHeight + bodyMargin * 2 + titleHeight;
const scale = 3;


canvas.width = width * scale;
canvas.height = height * scale;

ctx.fillStyle = '#FFF';
ctx.fillRect(
    0,0, 
    width * scale,height * scale
);

ctx.textAlign = 'left';
ctx.font = `${9 * scale}px sans-serif`;
ctx.fillStyle = '#AAA';
ctx.textBaseline = 'middle';
ctx.lineCap  = 'round';
ctx.lineJoin = 'round';
ctx.fillText(
    '框架 @卜卜口 · 魔改 @ SSShooter · 动画信息来自 anilist.co · 禁止商业、盈利用途',
    19 * scale,
    (height - 10) * scale
);

ctx.scale(scale,scale);
ctx.translate(
    bodyMargin,
    bodyMargin + titleHeight
);

ctx.font = '16px sans-serif';
ctx.fillStyle = '#222';
ctx.textAlign = 'center';


ctx.save();


ctx.font = 'bold 24px sans-serif';
ctx.fillText('动画角色个人喜好表',contentWidth / 2, -24 );




ctx.lineWidth = 2;
ctx.strokeStyle = '#222';

for(let y = 0;y <= row;y++){

    ctx.beginPath();
    ctx.moveTo(0,y * rowHeight);
    ctx.lineTo(contentWidth,y * rowHeight);
    ctx.globalAlpha = 1;
    ctx.stroke();

    if( y === row) break;
    ctx.beginPath();
    ctx.moveTo(0,y * rowHeight + rowHeight - fontHeight);
    ctx.lineTo(contentWidth,y * rowHeight + rowHeight - fontHeight);
    ctx.globalAlpha = .2;
    ctx.stroke();
}
ctx.globalAlpha = 1;
for(let x = 0;x <= col;x++){
    ctx.beginPath();
    ctx.moveTo(x * colWidth,0);
    ctx.lineTo(x * colWidth,contentHeight);
    ctx.stroke();
}
ctx.restore();


for(let y = 0;y < row;y++){

    for(let x = 0;x < col;x++){
        const top = y * rowHeight;
        const left = x * colWidth;
        const type = types[y * col + x];
        ctx.fillText(
            type,
            left + colWidth / 2,
            top + rowHeight - fontHeight / 2,
        );
    }
}



let currentBangumiIndex = null;
const searchBoxEl = document.querySelector('.search-bangumis-box');
const formEl = document.querySelector('form');
const searchInputEl = formEl[0];
const animeListEl = document.querySelector('.anime-list');

const openSearchBox = (index)=>{
    currentBangumiIndex = index;
    htmlEl.setAttribute('data-no-scroll',true);
    searchBoxEl.setAttribute('data-show',true);
    
    searchInputEl.focus();

    const value = bangumis[currentBangumiIndex];

    if(!/^https/.test(value)){
        searchInputEl.value = value;
    }
        
}
const closeSearchBox = ()=>{
    htmlEl.setAttribute('data-no-scroll',false);
    searchBoxEl.setAttribute('data-show',false);
    searchInputEl.value = '';
    formEl.onsubmit();
};

const setCurrentBangumi =  (value)=>{

    bangumis[currentBangumiIndex] = value;
    saveBangumisToLocalStorage();
    drawBangumis();

    closeSearchBox();
}

const setInputText = ()=>{
    const text = searchInputEl.value.trim().replace(/,/g,'');
    setCurrentBangumi(text);
}

animeListEl.onclick = e=>{
    const url = e.target.firstChild.src;
    if(currentBangumiIndex === null) return;
    setCurrentBangumi(url);
};


const searchFromAPI = async keyword=>{
    const animes = await graphQLGet(keyword);
    resetAnimeList(animes);
}

const resetAnimeList = animes=>{
    console.log('animes',animes)
    animeListEl.innerHTML = animes
        .filter(character => character?.image?.medium)
        .map(anime=>{
            return `<div class="anime-item" data-id="${anime.image.medium}"><img src="${anime.image.medium}"><h3>${anime.name.full}</h3></div>`;
        }).join('');
}

formEl.onsubmit = e=>{
    if(e) e.preventDefault();

    const keyword = searchInputEl.value.trim();

    searchFromAPI(keyword);
}

formEl.onsubmit();




const imageWidth = colWidth - 2;
const imageHeight = rowHeight - fontHeight;
const canvasRatio = imageWidth / imageHeight;

ctx.font = 'bold 32px sans-serif';

const drawBangumis = ()=>{
    for(let index in bangumis){
        const urlOrString = bangumis[index];
        if(!urlOrString) continue;
        const x = index % col;
        const y = Math.floor(index / col);

        if(!/^https/.test(urlOrString)){ // 非链接

            ctx.save();
            ctx.fillStyle = '#FFF';
            ctx.fillRect(
                x * colWidth + 1,
                y * rowHeight + 1, 
                imageWidth,
                imageHeight,
            )
            ctx.restore();
            ctx.fillText(
                urlOrString,
                (x + 0.5) * colWidth,
                (y + 0.5) * rowHeight - 4, 
                imageWidth - 10,
            );
            continue;
        }
        
        loadImage(urlOrString,el=>{
            const { naturalWidth, naturalHeight } = el;
            const originRatio = el.naturalWidth / el.naturalHeight;

            let sw, sh, sx, sy;
            if(originRatio < canvasRatio){
                sw = naturalWidth
                sh = naturalWidth / imageWidth * imageHeight;
                sx = 0
                sy = (naturalHeight - sh)
            }else{
                sh = naturalHeight
                sw = naturalHeight / imageHeight * imageWidth;
                sx = (naturalWidth - sw)
                sy = 0
            }

            ctx.drawImage(
                el,
                
                sx, sy,
                sw, sh, 

                x * colWidth + 1,
                y * rowHeight + 1, 
                imageWidth,
                imageHeight,
            );
        })
    }
}


const outputEl = document.querySelector('.output-box');
const outputImageEl = outputEl.querySelector('img');
const showOutput = imgURL=>{
    outputImageEl.src = imgURL;
    outputEl.setAttribute('data-show',true);
    htmlEl.setAttribute('data-no-scroll',true);
}
const closeOutput = ()=>{
    outputEl.setAttribute('data-show',false);
    htmlEl.setAttribute('data-no-scroll',false);
}

const downloadImage = ()=>{
    const fileName = '[薄红幻想][动画角色个人喜好表].jpg';
    const mime = 'image/jpeg';
    const imgURL = canvas.toDataURL(mime,0.8);
    const linkEl = document.createElement('a');
    linkEl.download = fileName;
    linkEl.href = imgURL;
    linkEl.dataset.downloadurl = [ mime, fileName, imgURL ].join(':');
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);

    showOutput(imgURL);
}

canvas.onclick = e=>{
    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    const x = Math.floor(((clientX - rect.left) / rect.width * width - bodyMargin) / colWidth);
    const y = Math.floor(((clientY - rect.top) / rect.height * height  - bodyMargin - titleHeight) / rowHeight);

    if(x < 0) return;
    if(x > col) return;
    if(y < 0) return;
    if(y > row) return;

    const index = y * col + x;

    if(index >= col * row) return;

    openSearchBox(index);
}


drawBangumis();